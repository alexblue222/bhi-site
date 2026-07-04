# BHI Homepage — Beam Spine Rework · Staged Plan

Homepage → one continuous cinematic scroll: a right-side **beam nav** with clickable nodes,
five space-scene sections (planets as anchors), scroll-driven choreography. Full vision in
`3 Memory/Projects/blue_horizon_hub_build_spec.md` (Obsidian) + the ChatGPT concept doc.

## How to run this
Each stage is scoped to finish **well inside one session (~25% of budget)** so it can't run out
mid-stage. Every stage **starts from a clean committed git state and ends with a
build + preview-deploy checkpoint** — so if a session dies, you lose nothing and resume at the
next stage. Do them in order. Stages 1–3 need **no Blender** (SVG placeholder orbs); Stage 4
waits on your renders. Tell the next session: *"Do Stage N of bhi-site/REWORK-PLAN.md."*

Guiding decisions already locked from the brainstorm:
- **Multiple PNG sequences, one per scene/asset** (NOT one giant sequence — you rejected that).
- **Clamp the scroll** (Lenis, installed) so speed is constant and animations pace to an exact timeline.
- **Placeholders first, Blender later** — lock the scroll + timing with SVG orbs, then render to it.
- Planets are anchors; **text/cards sit in open space around them, never on top.**
- Open question (Earth+Moon separate vs combined sequence) is **answered by Stage 3** — once the
  timeline is locked we know exactly which planets share the screen and must render together.

---

## Stage 1 — Scroll foundation (Lenis + pacing) · ~15%
**Goal:** kill the current jank. The "not smooth + jumping past sections" problem, fixed, on the
*existing* homepage — no redesign yet. This is the testbed everything else sits on.
- Wire **Lenis** (installed) to GSAP ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` + gsap ticker; `lerp` tuned for the clamped/inertial feel).
- Remove global `scroll-behavior: smooth` from `global.css` (it fights the wheel).
- Cut the hero from `600vh` → ~`300vh`; rebalance so content sections aren't sub-1-screen (stops the skip-past).
- `ScrollTrigger.refresh()` after fonts load (fixes reveal triggers firing at wrong spots).
- Respect `prefers-reduced-motion` (Lenis off, native scroll).
**Exit:** homepage scrolls smoothly, evenly paced, nothing skips. Build + preview deploy.

## Stage 2 — Beam-spine nav + section skeleton · ~25%
**Goal:** the structural bones of the new homepage, with placeholders.
- Build the **right-side beam nav**: fixed vertical beam, 5 nodes (Feed · Projects · Creators · Marketplace · About), each with a lens-flare dot. Click a node → smooth-jump to that section (Lenis `scrollTo`). Active node lights as you pass it (ScrollTrigger).
- Restructure the page into **5 full-height sections**, each with: a **placeholder orb** (SVG/gradient circle) where the planet will go, and the section **title + CTA in the open space beside it**. Basic on purpose.
- Reconcile final section order/labels (your two dumps differ — confirm at start of this stage).
**Exit:** the full scroll skeleton — beam nav jumps + activates, five paced sections, placeholders positioned. The "nail the mechanics" milestone. Build + preview deploy.

## Stage 3 — Scene choreography + transitions (placeholders) · ~25%
**Goal:** the cinematic timeline, fully working with placeholder orbs — **this becomes your Blender render spec.**
- GSAP scroll-timelines per section: orbs **enter / move / scale / leave**, nodes activate, content/cards reveal, transitions bridge scenes (e.g. feed items appear as you approach Feed).
- Orbs move exactly where the Blender planets will — so timing is locked and you render Blender **to this timeline** (frame X ↔ scroll position Y).
- Output a **shot list** (which planet is on screen when, per section) → answers the separate-vs-combined-sequence question.
**Exit:** a fully choreographed homepage with placeholder planets; a render-spec shot list. Build + preview deploy.

## Stage 4 — Blender render integration · ~25% · NEEDS YOUR RENDERS
**Goal:** swap placeholder orbs for the real Blender PNG sequences.
- Canvas-scrub each sequence to its section's scroll progress (reuse the hero `PlanetSequence` pattern — proven).
- One sequence per scene per the shot list; WebP-compressed, resolution-capped.
- **Mobile fallback:** static hero frame or a lighter sequence (don't ship tens of MB to phones).
**Exit:** real planets in every scene, on-timeline, performant. Build + preview deploy.

## Stage 5 — Tile/card integration + content + polish · ~25%
**Goal:** finish it.
- Style the section tiles/cards to feel **emergent from the animation** (feed pins pulling off Earth, project/creator/product cards in the scene's open space).
- **`/impeccable` pass** for anti-slop + a genuinely unique look; brand audit (amber only on Creators/community).
- Accessibility + perf: reduced-motion paths, mobile, Core Web Vitals.
**Exit:** finished cinematic homepage → promote to `main` on your approval.

---

## Token-safety notes
- Any stage that feels like it'll exceed ~25%: **split at its natural checkpoint** (e.g. Stage 2 → 2a beam-nav, 2b sections) rather than pushing through.
- Stages 1–3 are pure code (no Blender dependency) → can run back-to-back on days you're not rendering.
- Marketplace is still hidden from the live nav; the beam-spine's Marketplace *section* is homepage-only until you decide to launch the store.
