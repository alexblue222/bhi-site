// bhi-hub — public hub Worker for hub.bluehorizoninteractive.com
// Endpoints:
//   GET /feed      → normalized FeedItem[] from YouTube ({items:[]} until keys are set)
//   GET /auth      → Sveltia/Decap OAuth popup completion page (real gate = Cloudflare Access)
//   *   /github/*  → strict allowlist proxy to api.github.com (Cf-Access JWT required)
// 🔒 Standalone worker. No relation to lab./api. subdomains. Never logs or echoes secrets.

const REPO_PREFIX = "/repos/alexblue222/bhi-site";
const YT_TINT = "from-[#0a2a6b] to-[#1a9fff]"; // matches blog default tint in src/lib/content.ts

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

// ─── /feed — YouTube → FeedItem[] ─────────────────────────────────────────────

async function handleFeed(env, ctx) {
  if (!env.YOUTUBE_API_KEY || !env.YOUTUBE_CHANNEL_ID) return { items: [] };

  const channel = await cachedJson(
    `https://cache.bhi-hub/yt-channel/${env.YOUTUBE_CHANNEL_ID}`,
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(env.YOUTUBE_CHANNEL_ID)}&key=${env.YOUTUBE_API_KEY}`,
    ctx,
  );
  const uploads = channel?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) return { items: [] };

  const list = await cachedJson(
    `https://cache.bhi-hub/yt-playlist/${uploads}`,
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploads)}&maxResults=25&key=${env.YOUTUBE_API_KEY}`,
    ctx,
  );

  const items = (list?.items || [])
    .map((it) => {
      const s = it.snippet;
      const videoId = s?.resourceId?.videoId;
      if (!videoId || s.title === "Private video" || s.title === "Deleted video") return null;
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

  return { items };
}

/** Fetch JSON with caches.default (synthetic cache key — never contains the API key). */
async function cachedJson(cacheKeyUrl, fetchUrl, ctx, ttl = 600) {
  const cache = caches.default;
  const key = new Request(cacheKeyUrl);
  let res = await cache.match(key);
  if (!res) {
    const upstream = await fetch(fetchUrl);
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

  const allowed =
    ghPath === REPO_PREFIX ||
    ghPath.startsWith(REPO_PREFIX + "/") ||
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
