# Feed API setup — what YOU need to do

This activates the **live feed**: the hub Worker pulls your latest from **YouTube + Instagram +
Patreon**, normalises each to the site's card shape, and serves them newest-first at
`hub.bluehorizoninteractive.com/feed`. The site's `/feed` page already reads that endpoint, so once
this is done it lights up with **zero site changes**. (TikTok is deferred; the YouTube→Patreon
auto-cross-post idea is a separate later phase.)

**What's already built (me):** all three fetchers, token refresh, caching, merge-and-sort. The code
no-ops per platform until that platform's creds exist — so you can **activate one at a time** and the
feed grows as you go.

**What needs you:** the credentials below (only you can create these — they're tied to your
accounts) and one `wrangler deploy`.

Every secret is set with `npx wrangler secret put <NAME>` from inside `hub-worker/` (it prompts, you
paste, it never touches the repo). Non-secret values go in `wrangler.jsonc`.

---

## Before you start — two gating facts

- 🔴 **Instagram must be a Business or Creator account, set to Public.** Personal accounts cannot use
  any Meta API (the old personal-account "Basic Display" API was shut down Dec 2024). Convert in the
  IG app: **Settings → Account type and tools → Switch to professional → Business** (or Creator).
- You already have a Cloudflare account with the domain (Pages is there), so deploying the Worker +
  provisioning `hub.` is just `wrangler deploy`.

---

## Part 1 — YouTube (≈10 min, easiest, no OAuth)

1. **console.cloud.google.com** → create or pick a project.
2. **APIs & Services → Library** → search **"YouTube Data API v3"** → **Enable**.
3. **APIs & Services → Credentials → Create credentials → API key** → copy it.
   (Optional: **Restrict key** → API restrictions → YouTube Data API v3.)
4. **Get your Channel ID** (starts `UC…`): studio.youtube.com → **Settings → Channel → Advanced
   settings → Channel ID** → copy.
5. Set them:
   ```sh
   npx wrangler secret put YOUTUBE_API_KEY      # paste the key
   ```
   and put `YOUTUBE_CHANNEL_ID` in `wrangler.jsonc` (the `vars` block).

---

## Part 2 — Patreon (≈10 min)

1. Go to **patreon.com/portal/registration/register-clients** (logged in as the creator account).
2. **Create Client** → fill name/description; for the redirect URI put
   `https://bluehorizoninteractive.com` (unused by us, but required).
3. The client shows four values — you need three: **Client ID**, **Client Secret**, and the
   **Creator's Refresh Token** (the creator token already carries all v2 scopes, so no OAuth dance).
4. Set them:
   ```sh
   npx wrangler secret put PATREON_CLIENT_ID
   npx wrangler secret put PATREON_CLIENT_SECRET
   npx wrangler secret put PATREON_REFRESH_TOKEN     # the "Creator's Refresh Token"
   ```
   (Your campaign is auto-discovered; leave `PATREON_CAMPAIGN_ID` blank unless you want to pin one.)

---

## Part 3 — Instagram (≈30–45 min, the fiddly one)

*Prereq: the account is Business/Creator + Public (see gating facts above).*

1. **developers.facebook.com** → log in with your Facebook account → **verify** the developer
   account if prompted.
2. **My Apps → Create App** → use case **"Business"** → name it → create. Note the **App ID** +
   **App Secret** under **App settings → Basic** (you likely won't need these two if you use the
   dashboard-generated token, but keep them).
3. On the app dashboard: **Products → Instagram → Set up** → choose **"API setup with Instagram
   Login"** (⚠️ **not** "API setup with Facebook Login").
4. Under **"Generate access tokens" → Add account** → log in with your **Instagram Business/Creator**
   account → authorise.
5. Click **Generate token** next to the connected account → **copy the token immediately** (it's a
   long-lived token, ~60 days).
6. Set it:
   ```sh
   npx wrangler secret put INSTAGRAM_TOKEN      # paste the generated token
   ```
   The daily cron refreshes it before it expires — you only paste it once.

*Reading your own account's media needs no App Review while the app is in dev mode. App Review only
comes up if you later pull other accounts or extra permissions.*

---

## Part 4 — KV, config, deploy

1. **Create the token store:**
   ```sh
   npx wrangler kv namespace create HUB_KV      # copy the id it prints
   ```
2. In `wrangler.jsonc`, **uncomment** the `vars`, `kv_namespaces`, and `triggers` blocks and fill in:
   `YOUTUBE_CHANNEL_ID`, the `HUB_KV` `id`.
3. Make sure all the `wrangler secret put …` commands above are done for the platforms you're
   activating.
4. **Deploy:**
   ```sh
   npx wrangler deploy
   ```
5. **Verify:**
   ```sh
   curl https://hub.bluehorizoninteractive.com/feed
   ```
   You should see `{"items":[…]}` with your real posts. Open the site's `/feed` — the live items
   merge in with the git-committed ones automatically.

---

## Secret / var reference

| Name | Kind | Platform | Where it comes from |
|---|---|---|---|
| `YOUTUBE_API_KEY` | secret | YouTube | Google Cloud → Credentials |
| `YOUTUBE_CHANNEL_ID` | var | YouTube | YouTube Studio → Advanced (`UC…`) |
| `PATREON_CLIENT_ID` | secret | Patreon | register-clients page |
| `PATREON_CLIENT_SECRET` | secret | Patreon | register-clients page |
| `PATREON_REFRESH_TOKEN` | secret | Patreon | "Creator's Refresh Token" |
| `PATREON_CAMPAIGN_ID` | var | Patreon | optional (auto-discovered) |
| `INSTAGRAM_TOKEN` | secret | Instagram | Meta app → Generate token |
| `HUB_KV` | KV binding | all | `wrangler kv namespace create` |

## Notes

- **Incremental:** activate one platform at a time — each source returns nothing until its creds are
  set, and a failing source degrades to empty instead of breaking the feed.
- **Token expiry is handled:** Instagram (60d) and Patreon (~31d) tokens are refreshed by the daily
  cron and stored in KV. YouTube's key never expires.
- **Sorted by release date** (newest first), as requested. Per-platform card styling (YouTube
  long-vs-Short, Instagram, Patreon) is the next step once this is pulling real data.

## Sources

- [Instagram API with Instagram Login — Meta](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login)
- [Instagram API integration guide 2026 — Phyllo](https://www.getphyllo.com/post/instagram-api-integration-101-for-developers-of-the-creator-economy)
- [Patreon API Reference](https://docs.patreon.com/)
