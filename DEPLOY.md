# Deploying the site

⚠️ The Cloudflare Pages project **`blue-horizon-interactive`** (→ bluehorizoninteractive.com) is a
**direct-upload** project — it is **NOT connected to git**. Pushing to `main` does **nothing** on its
own. You must upload the build.

## Go live (production)
```sh
npm run deploy
```
That runs `astro build` then `wrangler pages deploy dist --project-name=blue-horizon-interactive
--branch=main`. `--branch=main` = the production branch → the custom domain. Needs `wrangler login`
once (Cloudflare account access).

## Branches
- `main` (git) — where the source lives; kept in sync but does **not** auto-deploy.
- `preview/master-anim-v2` — working branch history.
- A plain `wrangler pages deploy dist` **without** `--branch=main` creates a *preview* deployment
  (a `<hash>.blue-horizon-interactive.pages.dev` URL) that does **not** touch the live domain — handy
  for previewing before going live.

## The hub Worker (feed + CMS) deploys separately
`cd hub-worker && npx wrangler deploy` — see `hub-worker/README.md`.
