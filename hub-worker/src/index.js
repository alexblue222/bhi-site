// bhi-hub — public hub Worker for hub.bluehorizoninteractive.com
// Endpoints:
//   GET /feed      → normalized FeedItem[] from YouTube ({items:[]} until keys are set)
//   GET /auth      → Sveltia/Decap OAuth popup completion page (real gate = Cloudflare Access)
//   *   /github/*  → strict allowlist proxy to api.github.com (Cf-Access JWT required)
// 🔒 Standalone worker. No relation to lab./api. subdomains. Never logs or echoes secrets.

const REPO_PREFIX = "/repos/alexblue222/bhi-site";
const YT_TINT = "from-[#0a2a6b] to-[#1a9fff]"; // matches blog default tint in src/lib/content.ts
const IG_TINT = "from-[#3a1560] to-[#c13584]";      // instagram — magenta/purple
const PATREON_TINT = "from-[#3a1208] to-[#ff6b4a]"; // patreon — warm coral

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = allowedOrigin(request.headers.get("Origin"));

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin, true) });
    }

    try {
      if (url.pathname === "/feed" && request.method === "GET") {
        const data = await handleFeed(env, ctx);
        return json(data, 200, {
          ...cors(origin),
          "Cache-Control": "public, max-age=600",
        });
      }

      if (url.pathname === "/auth" && request.method === "GET") {
        return handleAuth(env);
      }

      if (url.pathname === "/github" || url.pathname.startsWith("/github/")) {
        return handleGithub(request, url, env, ctx, origin);
      }
    } catch {
      // never leak internals (or secrets) in errors
      return json({ error: "internal error" }, 500, cors(origin));
    }

    return json({ error: "not found" }, 404, cors(origin));
  },

  // Daily cron (wrangler triggers.crons) — proactively refresh the OAuth tokens that
  // expire (Instagram long-lived 60d, Patreon ~31d) and persist them to KV, so /feed
  // never serves a stale token. No-op for platforms whose creds aren't set.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshTokens(env));
  },
};

// ─── CORS ─────────────────────────────────────────────────────────────────────

function allowedOrigin(origin) {
  if (!origin) return null;
  if (origin === "https://bluehorizoninteractive.com") return origin;
  if (origin === "http://localhost:4321") return origin;
  if (origin.startsWith("https://") && origin.endsWith(".blue-horizon-interactive.pages.dev")) return origin;
  return null;
}

function cors(origin, preflight = false) {
  if (!origin) return {};
  const h = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true", // /github rides the CF_Authorization cookie
    "Vary": "Origin",
  };
  if (preflight) {
    h["Access-Control-Allow-Methods"] = "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extra },
  });
}

// ─── /feed — YouTube + Instagram + Patreon → FeedItem[], newest first ─────────
// Each source returns [] when its creds aren't set, so the feed lights up one
// platform at a time as Alex adds keys. Sources run in parallel; a failing source
// degrades to [] rather than breaking the whole feed.

async function handleFeed(env, ctx) {
  const sources = await Promise.all([
    safe(() => fetchYouTube(env, ctx)),
    safe(() => fetchInstagram(env, ctx)),
    safe(() => fetchPatreon(env, ctx)),
  ]);
  const items = sources
    .flat()
    .filter(Boolean)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)); // by release date
  return { items };
}

/** Never let one source's throw take down the feed. */
async function safe(fn) {
  try {
    return (await fn()) || [];
  } catch {
    return [];
  }
}

// ─── YouTube — API key + channel id (no OAuth) ───────────────────────────────

async function fetchYouTube(env, ctx) {
  if (!env.YOUTUBE_API_KEY || !env.YOUTUBE_CHANNEL_ID) return [];

  const channel = await cachedJson(
    `https://cache.bhi-hub/yt-channel/${env.YOUTUBE_CHANNEL_ID}`,
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(env.YOUTUBE_CHANNEL_ID)}&key=${env.YOUTUBE_API_KEY}`,
    ctx,
  );
  const uploads = channel?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return [];

  const list = await cachedJson(
    `https://cache.bhi-hub/yt-playlist/${uploads}`,
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploads)}&maxResults=25&key=${env.YOUTUBE_API_KEY}`,
    ctx,
  );

  return (list?.items || [])
    .map((it) => {
      const s = it.snippet;
      const videoId = s?.resourceId?.videoId;
      if (!videoId || s.title === "Private video" || s.title === "Deleted video") return null;
      // Long-form vs Short: the playlist snippet can't tell them apart (needs a
      // videos.list duration lookup — extra quota). TODO(feed): flag Shorts by
      // duration ≤ 3min so the card can render vertical. For now all read as video.
      return {
        id: `yt-${videoId}`,
        type: "video",
        platform: "youtube",
        title: s.title,
        excerpt: truncate(s.description),
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        publishedAt: s.publishedAt,
        source: "auto",
        media: {
          tint: YT_TINT,
          thumbUrl: bestThumb(s.thumbnails),
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
          aspect: "video",
        },
      };
    })
    .filter(Boolean);
}

// ─── Instagram — "Instagram API with Instagram Login" (Business/Creator acct) ─
// Long-lived token (60d) in KV (seeded from the INSTAGRAM_TOKEN secret); the cron
// refreshes it. graph.instagram.com/me/media → IMAGE | VIDEO | CAROUSEL_ALBUM.

async function fetchInstagram(env, ctx) {
  const token = (await kvGet(env, "ig_token")) || env.INSTAGRAM_TOKEN;
  if (!token) return [];

  const fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
  const data = await cachedJson(
    "https://cache.bhi-hub/ig-media",
    `https://graph.instagram.com/me/media?fields=${fields}&limit=25&access_token=${token}`,
    ctx,
  );

  return (data?.data || []).map((m) => {
    const isVideo = m.media_type === "VIDEO"; // Reels arrive as VIDEO
    return {
      id: `ig-${m.id}`,
      type: "social",
      platform: "instagram",
      title: firstLine(m.caption) || "Instagram post",
      excerpt: m.caption ? truncate(m.caption) : undefined,
      sourceUrl: m.permalink,
      publishedAt: m.timestamp,
      source: "auto",
      media: {
        tint: IG_TINT,
        thumbUrl: m.thumbnail_url || m.media_url, // videos expose a poster via thumbnail_url
        aspect: isVideo ? "video" : "square",
      },
    };
  });
}

// ─── Patreon — API v2, creator token (refresh-token grant → access token) ────

async function fetchPatreon(env, ctx) {
  const token = await patreonAccessToken(env);
  if (!token) return [];
  const auth = { Authorization: `Bearer ${token}` };

  let campaignId = env.PATREON_CAMPAIGN_ID;
  if (!campaignId) {
    const camps = await cachedJson(
      "https://cache.bhi-hub/patreon-campaigns",
      "https://www.patreon.com/api/oauth2/v2/campaigns",
      ctx,
      3600,
      auth,
    );
    campaignId = camps?.data?.[0]?.id;
  }
  if (!campaignId) return [];

  // v2 requires every attribute be explicitly requested via fields[post].
  const q = "fields%5Bpost%5D=title,url,published_at,is_public,is_paid&sort=-published_at";
  const posts = await cachedJson(
    `https://cache.bhi-hub/patreon-posts/${campaignId}`,
    `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/posts?${q}`,
    ctx,
    600,
    auth,
  );

  return (posts?.data || [])
    .filter((p) => p.attributes?.published_at)
    .map((p) => {
      const a = p.attributes;
      return {
        id: `patreon-${p.id}`,
        type: "patreon",
        platform: "patreon",
        title: a.title || "Patreon post",
        sourceUrl: a.url,
        publishedAt: a.published_at,
        source: "auto",
        memberOnly: a.is_public === false,
        media: { tint: PATREON_TINT, aspect: "video" },
      };
    });
}

// ─── OAuth token store (KV-backed, seeded from secrets) ──────────────────────
// KV persists rotating tokens so a refresh survives across requests/deploys. If no
// HUB_KV is bound the fetchers still work off the seed secrets (Patreon just re-mints
// an access token each cold start — fine, but bind KV in production).

async function kvGet(env, key) {
  try { return env.HUB_KV ? await env.HUB_KV.get(key) : null; } catch { return null; }
}
async function kvPut(env, key, val, ttl) {
  try { if (env.HUB_KV) await env.HUB_KV.put(key, val, ttl ? { expirationTtl: ttl } : undefined); } catch { /* ignore */ }
}

/** Patreon access token via the refresh-token grant, cached in KV for its lifetime. */
async function patreonAccessToken(env) {
  if (!env.PATREON_CLIENT_ID || !env.PATREON_CLIENT_SECRET) return null;
  const cached = await kvGet(env, "patreon_access");
  if (cached) return cached;

  const refresh = (await kvGet(env, "patreon_refresh")) || env.PATREON_REFRESH_TOKEN;
  if (!refresh) return null;

  const res = await fetch("https://www.patreon.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
      client_id: env.PATREON_CLIENT_ID,
      client_secret: env.PATREON_CLIENT_SECRET,
    }),
  });
  if (!res.ok) return null;
  const tok = await res.json();
  if (!tok.access_token) return null;

  // Cache the access token just under its lifetime; persist the (possibly rotated) refresh token.
  const ttl = Math.max(60, (tok.expires_in || 2678400) - 3600);
  await kvPut(env, "patreon_access", tok.access_token, ttl);
  if (tok.refresh_token) await kvPut(env, "patreon_refresh", tok.refresh_token);
  return tok.access_token;
}

// ─── Cron: refresh the expiring tokens ───────────────────────────────────────

async function refreshTokens(env) {
  // Instagram: extend the long-lived token (valid 60d; refreshable after 24h). Persist to KV.
  const igSeed = (await kvGet(env, "ig_token")) || env.INSTAGRAM_TOKEN;
  if (igSeed) {
    try {
      const r = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${igSeed}`,
      );
      if (r.ok) {
        const t = await r.json();
        if (t.access_token) await kvPut(env, "ig_token", t.access_token);
      }
    } catch { /* ignore */ }
  }
  // Patreon: drop the cached access token so the next /feed re-mints (and re-rotates) it.
  await kvPut(env, "patreon_access", "", 1);
}

/** Fetch JSON via caches.default (synthetic key — never contains a token). Optional auth headers. */
async function cachedJson(cacheKeyUrl, fetchUrl, ctx, ttl = 600, headers = undefined) {
  const cache = caches.default;
  const key = new Request(cacheKeyUrl);
  let res = await cache.match(key);
  if (!res) {
    const upstream = await fetch(fetchUrl, headers ? { headers } : undefined);
    if (!upstream.ok) return null;
    const body = await upstream.text();
    res = new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${ttl}`,
      },
    });
    ctx.waitUntil(cache.put(key, res.clone()));
  }
  return res.json();
}

function firstLine(s, n = 80) {
  if (!s) return undefined;
  const line = s.split("\n")[0].trim();
  if (!line) return undefined;
  return line.length <= n ? line : line.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

function bestThumb(t = {}) {
  const pick = t.maxres || t.standard || t.high || t.medium || t.default;
  return pick?.url;
}

function truncate(s, n = 180) {
  if (!s) return undefined;
  s = s.trim();
  if (!s) return undefined;
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}

// ─── /auth — Sveltia (Decap protocol) popup completion page ──────────────────

function handleAuth(env) {
  if (!env.GITHUB_PAT || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return json({ error: "CMS not activated" }, 503);
  }
  // Decap/Sveltia auth handshake. The token is a dummy — every real GitHub call
  // goes through /github/*, gated by Cloudflare Access + validated JWT.
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Signing in…</title></head><body>
<p>Completing sign-in…</p>
<script>
(function () {
  var ALLOWED = ${JSON.stringify(["https://bluehorizoninteractive.com", "http://localhost:4321"])};
  function originOk(o) {
    return ALLOWED.indexOf(o) !== -1 ||
      (/^https:\\/\\/[a-z0-9-]+\\.blue-horizon-interactive\\.pages\\.dev$/.test(o));
  }
  function receive(e) {
    if (!originOk(e.origin)) return;
    window.removeEventListener("message", receive);
    e.source.postMessage(
      "authorization:github:success:" + JSON.stringify({ token: "cf-access-proxy", provider: "github" }),
      e.origin
    );
  }
  window.addEventListener("message", receive);
  if (window.opener) {
    window.opener.postMessage("authorizing:github", "*");
  } else {
    document.body.textContent = "Open this page via the CMS sign-in button.";
  }
})();
</script>
</body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
    },
  });
}

// ─── /github/* — Access-JWT-gated allowlist proxy to api.github.com ──────────

async function handleGithub(request, url, env, ctx, origin) {
  if (!env.GITHUB_PAT || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return json({ error: "CMS not activated" }, 503, cors(origin));
  }

  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!jwt || !(await verifyAccessJwt(jwt, env, ctx))) {
    return json({ error: "forbidden" }, 403, cors(origin));
  }

  const ghPath = url.pathname.slice("/github".length) || "/";
  let decoded;
  try {
    decoded = decodeURIComponent(ghPath);
  } catch {
    return json({ error: "forbidden" }, 403, cors(origin));
  }
  // paranoia: no traversal segments, even percent-encoded ones
  if (decoded.split("/").some((seg) => seg === ".." || seg === ".")) {
    return json({ error: "forbidden" }, 403, cors(origin));
  }

  // The repo root itself (GET-only — metadata read, e.g. Sveltia's initial repo
  // check). Deleting/patching the bare path would delete/rename the whole repo.
  const isRepoRoot = ghPath === REPO_PREFIX && request.method === "GET";
  // Sub-paths (contents/git/branches/etc.) — the methods Sveltia's GitHub backend
  // actually issues: read + write + delete-a-file. No repo-root-level verbs reach here.
  const REPO_SUBPATH_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);
  const isRepoSubpath = ghPath.startsWith(REPO_PREFIX + "/") && REPO_SUBPATH_METHODS.has(request.method);

  const allowed =
    isRepoRoot ||
    isRepoSubpath ||
    (ghPath === "/user" && request.method === "GET") ||
    (ghPath === "/graphql" && request.method === "POST");
  if (!allowed) {
    return json({ error: "forbidden" }, 403, cors(origin));
  }

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${env.GITHUB_PAT}`);
  headers.set("User-Agent", "bhi-hub-worker");
  headers.set("Accept", request.headers.get("Accept") || "application/vnd.github+json");
  const ct = request.headers.get("Content-Type");
  if (ct) headers.set("Content-Type", ct);

  const upstream = await fetch(`https://api.github.com${ghPath}${url.search}`, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
  });

  // Rebuild the response with a minimal header set — never forward upstream
  // headers wholesale (no auth echo, no cookies).
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "application/json",
      "Cache-Control": "no-store",
      ...cors(origin),
    },
  });
}

// ─── Cloudflare Access JWT validation (RS256 via WebCrypto) ───────────────────

async function verifyAccessJwt(token, env, ctx) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [h, p, sig] = parts;

  let header, payload;
  try {
    header = JSON.parse(b64urlDecode(h));
    payload = JSON.parse(b64urlDecode(p));
  } catch {
    return false;
  }
  if (header.alg !== "RS256" || !header.kid) return false;

  const certs = await cachedJson(
    "https://cache.bhi-hub/access-certs",
    `https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`,
    ctx,
    3600,
  );
  const jwk = certs?.keys?.find((k) => k.kid === header.kid);
  if (!jwk) return false;

  let key;
  try {
    key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
  } catch {
    return false;
  }

  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlToBytes(sig),
    new TextEncoder().encode(`${h}.${p}`),
  );
  if (!ok) return false;

  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.ACCESS_AUD)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= now) return false;
  if (typeof payload.nbf === "number" && payload.nbf > now + 60) return false;

  return true;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function b64urlDecode(s) {
  return new TextDecoder().decode(b64urlToBytes(s));
}
