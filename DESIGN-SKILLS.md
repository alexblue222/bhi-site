# Design skills — how to use them on this site

A design-skill toolkit is installed in `~/.claude/skills/` (catalogued in the Obsidian vault at
`3 Memory/References/skills_index.md`). This file says **which ones apply to bluehorizoninteractive.com,
and when to reach for each** — read it before doing UI/design work here, especially on a strong design
model (Fable).

## Ground rules for THIS site

1. **The aesthetic direction is already set — do not reinvent it.** Blue Horizon is dark sci-fi,
   restrained, monumental — a *beacon on a horizon*. Brand system: `PROJECT.md` §3. Tokens + fonts are
   live in `src/styles/global.css` (`bh-*` colours incl. **amber** `#ffb347` for the human/community
   surfaces; **Space Grotesk** display / **Inter** body / **Michroma** logo-only). So `frontend-design`'s
   "pick a direction" step = **follow the established BHI direction**, don't invent a new one.
2. **Reuse the design system that exists.** Shared primitives live in `src/components/ui/` (`GlassCard`,
   `PlatformBadge`, `SectionHead`, `Chip`, `MediaTile`, `States`, `Connect`) and cards in
   `src/components/cards/`. Content model + mock data: `src/lib/data.ts`. Build with these, don't fork them.
3. **Stack is fixed:** Astro 7 + React islands + Tailwind v4 (`@theme` tokens) + `motion/react` +
   react-three-fiber. `client:*` islands only where genuinely interactive.
4. **Mobile/native skills do NOT apply here** (`mobile-app-ui-design`, `swiftui-skills`, `material-3`,
   `expo-*`) — those are for future app projects, not this web build. Ignore them for the website.

## Which skill, when (web work)

**Starting a new page/surface → set direction & quality:**
- `frontend-design` — aesthetic intentionality; use it to *apply* the BHI direction crisply, not to pick a new one.
- `design-taste-frontend` — anti-slop check + non-templated layout; **audit-first when redesigning** an existing page.
- `premium-frontend-ui` — when a surface should feel award-level / cinematic (the hero, a landing, a case study): scroll storytelling, oversized type, motion systems.

**Aesthetic variant (only if a surface wants its own tone):**
- `industrial-brutalist-ui` — a candidate for **data-heavy surfaces** (the marketplace grid, a stats/telemetry page) if we ever want them to read as "declassified blueprint." Keep it inside the BHI palette.
- `minimalist-ui` — for calm, editorial surfaces (About, long-form devlog posts).
- Default: neither — most of the site is the established cinematic-dark direction.

**Systems, components, tokens:**
- `ui-ux-pro-max` — the reference brain: color systems, font pairings, UX guidelines, product-type patterns. Good for "what's the right pattern for a marketplace product page / dashboard / feed."
- `design-system` — when formalising/extending tokens (it outputs Tailwind v4 `@theme` blocks — matches our `global.css`).
- `ui-styling` + `shadcn` — when adding real interactive components (dialogs, dropdowns, forms, tables, command palettes). shadcn (Radix/Base UI + Tailwind) composes cleanly into our React islands; keep the `bh-*` tokens.

**Animation (this site is animation-forward — the hero is the brand):**
- `gsap-scrolltrigger` + `gsap-timeline` + `gsap-core` + `gsap-react` — **the strongest tool for scroll-driven / pinned / choreographed sequences.** The current hero uses `motion/react` (`useScroll`/`useTransform`); GSAP ScrollTrigger is a valid upgrade path for complex scroll choreography. Pick one per surface — don't mix motion libraries in the same component.
- `gsap-performance` — keep animations on transforms/opacity, 60fps, respect `prefers-reduced-motion`.
- `gsap-plugins` (SplitText, Flip, ScrollSmoother), `gsap-utils`, `gsap-frameworks` (non-React) as needed.
- `frontend-ui-ux` — micro-interaction / motion / color polish pass.

## Suggested pipeline for a page

1. **Direction** — `frontend-design` (apply BHI look) → optionally a variant skill for tone.
2. **Structure & patterns** — `ui-ux-pro-max` for the right layout/pattern; reuse `src/components/ui`.
3. **Components** — `shadcn` / `ui-styling` for interactive pieces; `design-system` if tokens need extending.
4. **Motion** — `gsap-*` (or existing `motion/react`) for scroll/timeline; `gsap-performance` to keep it smooth.
5. **Audit** — `design-taste-frontend` (anti-slop) + the project's own checks (accessibility, `prefers-reduced-motion`, Core Web Vitals). Verify in a real browser (the hero shader won't render in a headless/background tab).

## Verify
- Build (`npm run build`) + deploy a **non-`main` preview branch** for eyes-on before promoting to `main`.
- Brand check: uses `bh-*` tokens, amber only on human/community surfaces, Michroma reserved for the logo.
- 🔒 Never touch `lab.`/`api.` or the Notion token (see `CLAUDE.md`).
