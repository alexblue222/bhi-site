# BHI Hub — Build Spec (locked via grill, 2026-07-03)

The decisions Fable builds to. Companion to `PROJECT.md` (brand/IA), `DESIGN-SKILLS.md`
(which skills, when), `plans/…hub-expansion` (design brief). This file is the **locked
answers**; where it conflicts with the older brief, this wins.

## Direction
- **Cinematic-dark throughout** — beacon/glow language, soft motion, oversized type on
  every surface. One cohesive sci-fi world, not a hero + calm brochure.
- **Motion:** **GSAP ScrollTrigger** for all new scroll choreography (feed/artists/home).
  **Hero is untouched** — it ships as-is (three.js planet + beam + logo dock); only the
  reported **beam-flash at scroll-start** and **logo-dock** bugs get fixed in place. Never
  mix motion libs in one component.
- **Amber (`#ffb347`)** stays reserved for **artists + community milestones** only.
- Type/tokens already live in `global.css` (Space Grotesk display · Inter body · Michroma
  logo-only). Don't reinvent.

## Scope at launch
- **Nav:** Home · Feed · Games · Artists · Studio.
- **Marketplace:** built but **out of nav + noindex** — ready to flip on later. Not launched.
- **Launch posture:** deploy to production but **keep `noindex`** until real content is in
  the CMS; flip to indexed when populated.

## Content layer — how staff edit
- **Visual CMS at `/admin`: Sveltia**, gated by **Cloudflare Access** (email allow-list =
  the staff login; staff never see GitHub). Commits land in a **private GitHub repo under
  `alexblue222`** via one service token.
- **Collections (Astro content collections, markdown):**
  - `blog` — posts/devlogs. **Rich markdown + images + YouTube embeds.** Fields: title,
    slug, author→artist, publishedAt, tags[], hero media, body.
  - `artists` — roster profiles. name, role, bio, avatar, socials{}, portfolio[].
  - `pins` — manual feed curation: {url, note, order}. The manual half of the feed.
- **Games** stay code-managed in `data.ts` for now (few entries, no CMS collection).

## Feed data model
- **Client-side live fetch.** The `/feed` page merges, in the browser:
  1. **Live YouTube** from the **hub Worker** (below), +
  2. **Git content** — `blog` posts + `pins` (featured/pinned items).
- **Layout:** **single centered column everywhere** — big media, editorial, calm. (Not masonry.)
- **Card click:** **expand in-place to embed** (lazy thumbnail → inline player). Keeps
  people on-site. First-party posts also have `/feed/[slug]` detail pages.
- Cards keep the shared glass-card + platform-badge system so the shape is stable when
  Patreon/Instagram get wired later (placeholder slots for now).

## Backend — new PUBLIC Worker (v1, because of live fetch)
- **`hub.bluehorizoninteractive.com`** — new public Cloudflare Worker.
  - Fetches **YouTube** (Data API v3; **API key = Worker secret**, never in repo).
    **DEFERRED: no key yet** (2SV pending on Alex's account). Build the Worker + the
    `/feed?youtube` path now but have it **return `[]` when `YOUTUBE_API_KEY` is unset**,
    so the feed renders from git content alone until the key lands. Zero code change to
    turn it on — Alex just `wrangler secret put YOUTUBE_API_KEY` + sets the channel ID.
  - Serves normalized `FeedItem[]` matching `data.ts` shapes.
  - Placeholder endpoints/slots for **Patreon** + **Instagram** (manual/oEmbed later).
- 🔒 **HARD BOUNDARY:** this is a *new* public subdomain. **Never** touch, route through,
  or reuse `lab.` / `api.` or the Notion-token Worker. No secrets from those here.

## Deferred (not this build)
- Marketplace launch + Lemon Squeezy checkout (built, hidden).
- Patreon members-only lock UI + Instagram/TikTok live pulls (placeholder slots only).
- Newsletter provider — **placeholder signup field, `TODO(alex)`**, wire later.
- Kickstarter/SuperHive/Fab cards — manual link-cards when they exist.

## Alex's setup prerequisites (not code)
1. Create the **private GitHub repo** (`alexblue222/bhi-site`) — I can push once it exists.
2. **Cloudflare Access** app over `/admin` (email allow-list of staff).
3. A **YouTube Data API key** + the **channel ID** to pull → I'll store the key as a Worker secret.

## Build order
1. Content collections + Sveltia config + `/admin` (the editing layer).
2. hub Worker (YouTube live fetch) on `hub.` subdomain.
3. Rebuild `/feed` on the merged live+git model, single-column, expand-embed, GSAP reveals.
4. `/artists` + `/artists/[slug]` from the `artists` collection (amber).
5. Home tour: **Latest feed · Featured games · Artists · Connect** (drop marketplace teaser).
6. Fix hero beam-flash + logo-dock bugs. Global nav/footer to final IA.
7. Build → preview branch → your eyes → promote to `main` (still `noindex`).

## STATUS 2026-07-04 (session wrap — resume here)
BUILT + preview-deployed (branch hub-v2). Done: collections+CMS(/admin)+hub Worker(live, inert)+feed/artists/home rebuilds+nav. Hero fixes verified in code.
FIXED this session: nested <a> in FeedCard Author (#418 HTML), relTime hydration drift (suppressed), pins build-time date → constant sentinel, compressHTML:false (last #418 suspect — VERIFY /feed console clean on next session).
CONFIRMED review findings still TO FIX:
1. MAJOR (security, dormant until PAT set): hub-worker/src/index.js ~L225 — /repos/* proxy arms lack HTTP-method restriction (DELETE repo possible). Fix BEFORE CMS activation.
2. MAJOR (taste): FeedCard ExpandingPlayer tweens height (layout) — use GSAP Flip or add ScrollTrigger.refresh() onComplete.
3. minor: HubSections L211 + artists/[slug] L102 fork GlassCard amber recipe inline (24px vs 32px glow drift) → use GlassCard glow="amber".
4. minor: FeedCard Patreon colors hardcoded (#ff9d8d orphan, #ff7864 dup) → use PLATFORM_META.patreon.color.
5. minor: font-bold badges (FeedCard 'New', ProductCard 'Free', CartDrawer count) but Inter loads 400/500/600 → font-semibold.
Alex TODO: GitHub PAT + CF Access (see hub-worker/README.md + ADMIN.md), YouTube key (2SV pending). Promote to main only on Alex approval: npx wrangler pages deploy dist --project-name=blue-horizon-interactive --branch=main
