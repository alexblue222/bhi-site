# bhi-hub — public hub Worker

Public Cloudflare Worker on `hub.bluehorizoninteractive.com`. Two jobs:

1. **Live feed** — pulls the channel's YouTube uploads and serves them as normalized
   `FeedItem[]` (same shape as `src/lib/data.ts`).
2. **CMS backend** — Sveltia auth completion page + a strict allowlist proxy to the
   GitHub API, both gated by **Cloudflare Access** (staff never see GitHub).

🔒 Standalone worker. Shares nothing with `lab.` / `api.` or the Notion worker.

## Endpoints

| Route | Method | Behaviour |
|---|---|---|
| `/feed` | GET | `{items: FeedItem[]}` merged from **YouTube + Instagram + Patreon**, newest first. Each source is independent — returns nothing until its creds are set, and a failing source degrades to empty. Upstream calls cached 600 s; response `Cache-Control: max-age=600`. **Setup: see [API-SETUP.md](./API-SETUP.md).** |
| `/auth` | GET | Decap/Sveltia OAuth popup completion page. `503 {"error":"CMS not activated"}` until `GITHUB_PAT` + `ACCESS_TEAM_DOMAIN` + `ACCESS_AUD` are all set. The token it hands the CMS is a dummy — real auth is Cloudflare Access in front of this route. |
| `/github/*` | any | Proxy to `api.github.com` with the server-side PAT. Requires a **valid `Cf-Access-Jwt-Assertion`** (RS256 signature verified against the team's Access certs, `aud` + `exp` checked). Allowlist: `/repos/alexblue222/bhi-site*`, `GET /user`, `POST /graphql`. Everything else → 403. |
| anything else | — | `404 {"error":"not found"}` |

CORS allows `https://bluehorizoninteractive.com`, `https://*.blue-horizon-interactive.pages.dev`,
and `http://localhost:4321` (with credentials, for the Access cookie).

## Environment

| Name | Kind | Set with |
|---|---|---|
| `GITHUB_PAT` | secret | `npx wrangler secret put GITHUB_PAT` |
| `YOUTUBE_API_KEY` | secret | `npx wrangler secret put YOUTUBE_API_KEY` |
| `YOUTUBE_CHANNEL_ID` | var | `vars` block in `wrangler.jsonc` (or dashboard) |
| `INSTAGRAM_TOKEN` | secret | `npx wrangler secret put INSTAGRAM_TOKEN` (long-lived, cron-refreshed) |
| `PATREON_CLIENT_ID` / `PATREON_CLIENT_SECRET` / `PATREON_REFRESH_TOKEN` | secret | `npx wrangler secret put …` |
| `PATREON_CAMPAIGN_ID` | var | optional (auto-discovered) |
| `HUB_KV` | KV binding | `npx wrangler kv namespace create HUB_KV` → id in `wrangler.jsonc` |
| `ACCESS_TEAM_DOMAIN` | var | e.g. `myteam.cloudflareaccess.com` |
| `ACCESS_AUD` | var | the Access application's AUD tag |

The feed platforms (YouTube / Instagram / Patreon) have their own click-by-click guide in
**[API-SETUP.md](./API-SETUP.md)** — start there.

`GITHUB_PAT`: fine-grained PAT scoped to **only `alexblue222/bhi-site`** —
Contents: read/write, Metadata: read (add Pull requests: read/write if Sveltia's
editorial workflow gets used). Never goes in the repo or `wrangler.jsonc`.

## Cloudflare Access setup (Alex)

1. **Zero Trust dashboard → Access → Applications → Add → Self-hosted.**
   - App 1: "BHI Hub CMS". Application domain: `hub.bluehorizoninteractive.com`,
     add **two paths**: `/auth` and `/github` (covers `/github/*`).
   - Policy: Allow → Include → Emails → the staff allow-list.
   - In the app's **Settings → CORS**, enable **"Bypass OPTIONS requests to origin"**
     (preflights carry no cookie, so Access must let them through).
   - Copy the app's **AUD tag** (Overview tab) → that's `ACCESS_AUD`.
   - Your team domain (`<team>.cloudflareaccess.com`) → `ACCESS_TEAM_DOMAIN`.
2. **App 2**: same policy, over `bluehorizoninteractive.com/admin` (gates the CMS UI itself).

## Activation checklist

- [ ] Create private repo `alexblue222/bhi-site` + fine-grained PAT
- [ ] Access app over `hub.bluehorizoninteractive.com` (`/auth`, `/github`), bypass-OPTIONS on, note AUD
- [ ] Access app over `bluehorizoninteractive.com/admin`
- [ ] `npx wrangler secret put GITHUB_PAT`
- [ ] Set `ACCESS_TEAM_DOMAIN` + `ACCESS_AUD` vars in `wrangler.jsonc` → `npx wrangler deploy`
- [ ] `/auth` now serves the popup page instead of 503 → CMS live
- [ ] YouTube: `npx wrangler secret put YOUTUBE_API_KEY` + set `YOUTUBE_CHANNEL_ID` var → `/feed` goes live (no code change)

## Deploy

```sh
cd hub-worker
npx wrangler deploy
```

Verify: `curl https://bhi-hub.<account>.workers.dev/feed` → `{"items":[]}`,
`/auth` → 503 until activated. Same on `https://hub.bluehorizoninteractive.com`
once the custom domain provisions.

## Feed platforms — built, awaiting creds

YouTube · Instagram · Patreon fetchers are all implemented in `src/index.js` (normalised to
`FeedItem`, merged newest-first, token refresh via the daily cron). They're inert until each
platform's creds are set — follow **[API-SETUP.md](./API-SETUP.md)**. TikTok is still deferred.

## Later

- Per-platform card styling on `/feed` (YouTube long-vs-Short, Instagram, Patreon).
- YouTube→Patreon auto-cross-post (Alex's "part two").
