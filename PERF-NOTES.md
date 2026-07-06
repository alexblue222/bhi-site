# Known issue: scroll stutter (pause → freeze → jump)

**Status: parked 2026-07-06** — optimize after content iteration settles. This file is the
head start for that sprint.

## Symptom
Scrolling the homepage, pausing, then resuming freezes the page for 0.5–1.6s, then it
jumps forward. Main-thread rAF gaps of `BLOCK 500–1639ms` recorded via the `?perf` HUD.

## Ruled OUT (all tested, stutter persisted)
- Lenis smooth-scroll easing (`?nosmooth` = native scroll was WORSE — Lenis *masks* the jank)
- The master planet canvas (`?noseq` removes it entirely — still stutters)
- Decode pre-warming (`?nowarm`)
- Unreal Editor GPU contention (fully closed — still stutters)
- Dev-server overhead (production build via `astro preview --port 4322` — still stutters)

## Key forensic clue
Big rAF gaps with **no `longtask` entries** → likely NOT JavaScript execution; points at
raster/compositor (GPU) stalls. (Re-verify: longtask observer was re-registered with
`{type, buffered}` late in the session — confirm it fires at all in Opera.)

## Prime remaining suspects (in attack order)
1. ~~Hero's fixed logo layer (full-screen mix-blend, persisted at opacity 0 forever)~~
   **DONE 2026-07-06**: unmounts at heroP>=0.995, restores on scroll-up (HeroStage logoLive).
   Remaining: the hero *stage* canvases (PlanetSequence/ShaderBeacon/Particles) live in a
   sticky section that scrolls offscreen naturally — verify they're actually skipped by the
   compositor; consider suspending their rAF loops when out of view.
2. **CSS filter on the canvas** (`brightness/contrast/saturate`) — bake the grade into
   the webp frames at publish time (ffmpeg `eq=`) and delete the filter.
3. **mix-blend-screen may be unnecessary** — the backing div is near-black (#01030a);
   screen-blending against near-black ≈ normal paint. Try plain compositing.
4. **DPR cap** — canvases render at `min(devicePixelRatio, 2)`; try 1.25–1.5.
5. **Image memory churn** — 396 HTMLImageElements held forever; try a sliding window
   (retain ±40 decoded, null out the rest, reload on approach).
6. Browser/machine matrix — reproduce in Edge/Chrome + another PC (Opera-specific?).

## Tools already in place
- `?perf` — on-screen stall profiler (rAF gaps, long tasks, scroll jumps) in HomeScenes.tsx
- `?noseq` / `?nowarm` / `?nosmooth` — bisection kill-switches (HomeScenes /
  ScenePlanetSequence / smoothScroll)
- `?vh=N`, `?edit` — scroll length + alignment tuning
