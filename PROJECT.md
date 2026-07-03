# Blue Horizon Interactive — Website Build Brief

> North-star doc for building **bluehorizoninteractive.com**. Read this first, every session.
> Sources: Alex's Obsidian profile, the brand visual-identity + public-messaging memories, and
> `claude-scripts/foundations/01_The_Beacon_And_Blue_Horizon.md` (the deep mission).

---

## 1. Who this is for

**Alex Sheridan** ("Alex Blue") — rural Co. Wicklow, Ireland. Visual software architect, game
developer, digital-media creator, founder of **Blue Horizon Interactive**. Works design-first and
**SVG-first**, dark aesthetic, concise. Runs a UE5 psychological-horror game (*Codename Lyra*), a
YouTube channel + Patreon, motion graphics in **Cavalry**, philosophy writing, and **Blender plugins**.
Small team forming (Fionn — animation; Pablo).

**Working style (apply it):** concise and direct, no preamble, prose over bullet lists, **design/diagram
before code**, flag problems immediately, and **produce output rather than asking for permission first.**

---

## 2. What Blue Horizon Interactive is

A **layered brand**. Two audiences, one identity:

- **Public surface (what the site leads with):** *"Building games and tools for the future."* Concrete,
  playable, inviting — games, tools, explainers. This is what a cold visitor sees first.
- **Deep mission (for those who go looking):** Blue Horizon is a **beacon** — a signal on the horizon
  giving direction to people already searching. The consciousness/media arm of a larger project (paired
  with *RDMAPS* = the matter arm, and *AI* = the connector). Five domains: **Science, Art, Games, AI,
  Human Development.** Media explains models · games let people inhabit them · tools let people build with them.

**Rule:** first-touch copy = concrete games/tools framing. Save the consciousness/civilisation language
for long-form, About-deep, or content that explicitly asks for it. The depth is always *present beneath*
the surface, never *front-loaded*.

---

## 3. Brand system (fixed constraints, not open decisions)

**Palette (dark-first):**
| Token | Hex | Use |
|---|---|---|
| bg / near-black | `#0B0F16` | page background |
| deep navy | `#12263A` | panels, depth |
| mid blue | `#1E4D75` | borders, secondary |
| **beacon cyan** | `#58D6FF` | the glow / primary accent |
| electric blue | `#2E9BFF` | interactive accents, links |
| **amber** | `#FFB347` | **the human element** — use sparingly as warm counterpoint; do not lose it |
| charcoal | `#2A2F36` | surfaces |
| off-white text | `#E6EDF3` | body text |

> The current live site uses approximate blues and **no amber yet** — aligning to these exact tokens
> (and introducing the amber accent) is an early polish task.

**Motif:** a **vertical beacon of light piercing a horizon line**, inside/beside a **thin circle**
(orbit/field-of-awareness), with a **hot point of light at the crossing** and a **blue glow**.
**Typography:** wide-spaced technical sans for "BLUE HORIZON", lighter weight for "INTERACTIVE".

**Voice:** dark sci-fi, restrained, monumental. **Primary tagline:** *"The future is not given to us.
It is built."* Deeper lines (About-deep / long-form): *"We do not fear the dark. We build the light." ·
"Building worlds. Expanding humanity." · "Explore. Build. Preserve. Transcend."*

**The beacon symbol carries meaning** (drives the hero animation): horizon = known/unknown boundary ·
beacon = signal/navigation · circle = field of awareness · central light = origin/spark · blue glow =
clarity transmitted through darkness. The hero should *assemble the symbol* — flare igniting on the
horizon, beam pulling up, ring forming, resolving into the mark — because that literally enacts the brand.

---

## 4. What the site must do

1. **Sell services** — studio-for-hire (Studio arm: cinematics, tools, pipelines).
2. **Sell products** — **Blender plugins** (digital downloads + license keys + updates).
3. **Portfolio** — games, cinematics, tools; case studies.
4. **Run with a team** — non-devs updating content (needs a CMS eventually).
5. **Grow audience** — devlog, YouTube/Patreon, newsletter, wishlists.

---

## 5. Locked technical decisions

- **Framework:** **Astro** (React islands + Tailwind v4), static output. Repo: `Claude Folder/bhi-site`.
  (Legacy Vite SPA in `Claude Folder/futuristic-website` — reference only.)
- **Host:** **Cloudflare Pages**, project `blue-horizon-interactive`. Deploy: `npx wrangler pages deploy dist`.
  Production branch = `main`; use a non-`main` `--branch` to get a preview URL without touching the live domain.
- **Commerce:** **Lemon Squeezy** (merchant of record — handles EU/global VAT, license keys, downloads,
  update hosting). Store API/license checks live on a **new** Worker/subdomain (e.g. `shop.`).
- **Rendering strategy:** static HTML for all content (SEO); `client:only` islands only where needed
  (hero, charts). Keep `noindex` until content is real, then remove for launch.
- **Hero symbol:** current 2D-canvas beam/flare is a placeholder → moving to **WebGL/shader** (see §7).

### 🔒 Reserved — do not touch
`lab.bluehorizoninteractive.com` and `api.bluehorizoninteractive.com` are Alex's **private backend**
(health/RPG dashboards + a Notion-token Worker). Never create, route, override, or embed anything there,
and **never request or handle the Notion token.** Public store work uses its own subdomain.

---

## 6. Information architecture — HUB model (reconciled 2026-07-03)

The site is the **hub of the whole social presence** — an aggregation point for YouTube, Patreon,
Instagram, TikTok, Gumroad, SuperHive, Fab (later Kickstarter). Primary nav:

`/` (landing: hero + hub tour) · **`/feed`** (the unified aggregation feed — centerpiece; post detail
at `/feed/[slug]`) · `/games` · **`/marketplace`** (+ `/marketplace/[slug]`, direct sales via Lemon
Squeezy) · **`/artists`** (curated roster + `/artists/[slug]` portfolios — the amber surface) ·
`/studio` · `/about` · `/contact` · legal.

Folded in: `/devlog`→feed filter · `/work`→games · `/team`→artists · `/interactive`→games ·
`/store`→marketplace (301s in `public/_redirects`). Content models (FeedItem/Artist/Product) +
placeholder data live in `src/lib/data.ts`; the future aggregation Worker must emit the same shapes
on a NEW public subdomain (never `lab.`/`api.`). Full design brief: the 2026-07-03 hub plan.

---

## 7. Priorities & roadmap

- **P1 — Foundation & IA** ✅ *done*: Astro migration, nav, routes, hero-as-island, live on domain.
- **P2 — Brand & hero symbol** 🟢 *hero live on production (2026-07-03)*: scroll-driven hero shipped —
  planet rises → **backs out** (matches the logo horizon) → **WebGL shader flare + beam** ignite → crossfade
  into the **real logo** → **docks to the top-left and becomes the header logo** (symbol + Michroma wordmark).
  See the **Hero build log** below. *Remaining:* apply the exact palette + amber accent site-wide; a proper
  Blender re-render of the backed-out planet (camera pull-back, not the current website scale stopgap).
- **P3 — Content:** real About/Studio/Interactive copy, portfolio case studies, devlog, team.
- **P4 — Plugin store:** product pages, Lemon Squeezy checkout, license keys + downloads, in-plugin check.
- **P5 — Services + launch:** service offerings + inquiry flow, SEO, perf, remove `noindex`, go public.

---

## 8. Build conventions

- Components in `src/components/{hero,site}`; pages in `src/pages/*.astro`; shared shell in `Layout.astro`.
- Prefer **static** React components (no client directive) → SSR to HTML. Add `client:load/visible/only`
  only for genuine interactivity (Header scroll, charts, hero).
- Tailwind v4 via `@tailwindcss/vite`; brand tokens from §3; dark-first.
- Verify by building (`npm run build`) — the preview screenshot tooling is unreliable this session, so
  prefer built-HTML checks + deploying to a preview `--branch` for eyes-on before promoting to `main`.
- Accessibility + performance are not optional (Alex's standard); keep bundles lean.

---

## 9. Hero build log (2026-07-03)

The hero (`src/components/hero/`) is **live on production**. How it works and why:

- **`HeroStage.tsx`** — orchestrator. Scroll drives a `progress` 0→1 motion value. Timeline: planet rises
  (0–0.22) · **backs out** (0.06–0.26) · darken (0.22–0.42) · shader flare/beam (0.30–0.58) · crossfade to
  logo (0.58–0.72) · **dock to top-left + dissolve into the header logo** (0.86–1.0). Freeze any moment with
  `?p=0.5` in the URL.
- **`PlanetSequence.tsx`** — 95 Blender WebP frames (`public/planet/`) scrubbed by scroll onto a `<canvas>`
  with `mix-blend-mode: screen` (black drops out, glow adds). The planet is **scaled down at rest**
  (`REST_SCALE`, ~0.36) so its rim curvature matches the logo's tighter horizon — with an elliptical edge
  feather so the cropped plate floats instead of showing a hard rectangle.
- **`ShaderBeacon.tsx`** — GLSL fullscreen-quad flare + beam (react-three-fiber + postprocessing Bloom),
  screen-composited, pinned to the logo's flare point. This is the beacon flare/beam (the cut-out PNGs were
  dropped — the reveal uses the real logo image only).
- **Header** (`src/components/site/LogoMark.tsx`, `Header.tsx`) — real symbol cropped from the master logo +
  "BLUE HORIZON INTERACTIVE" in **Michroma** (Google Font, closest to the logo's lettering). The hero logo
  docks here and fades so the crisp header mark takes its place.

**Anchoring:** the logo's horizon apex is fitted to the measured planet rim apex (`RIM_APEX`, plate px). The
logo's baked planet-ellipse curves ~2.7× tighter than the raw planet rim, which is why the planet is scaled
down to match. Brand assets in `public/brand/` (`logo-main.webp`, `logo-symbol.webp`).

**Known / deferred:** planet back-out is a website scale stopgap — the proper fix is a Blender re-render with
a **camera pull-back + re-aim** (lens-only can't frame a logo-sized planet). The shader won't render in a
hidden/background browser tab (rAF suspended) — verify it in a foreground browser. Header dock + Michroma
logo were on preview pending sign-off as of end of 2026-07-03.

---
*Living doc — update as decisions change. Last updated 2026-07-03.*
