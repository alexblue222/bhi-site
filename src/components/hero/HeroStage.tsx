import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Particles } from "./Particles";
import { PlanetSequence } from "./PlanetSequence";
import { ShaderBeacon } from "./ShaderBeacon";

// Hero scroll timeline (progress 0→1). Light is screen-composited on the dark planet (black drops
// out, glow adds). The beacon flare + beam are drawn by a WebGL shader; the reveal uses the real logo.
//   0.00–0.22 PLANET rises · 0.06–0.26 BACKS OUT (rim matches the logo) · 0.22–0.42 DARKEN ·
//   0.30–0.58 SHADER flare ignites + beam rises at the beacon point · 0.58–0.72 CROSSFADE to the
//   full logo · 0.86–1.0 DOCK the mark to the top-left. Add ?p=0.5 to the URL to FREEZE the hero.
const SRC_W = 1280, SRC_H = 720;
const RIM_APEX = { x: 640, y: 342 };                // planet's rim apex, plate px (geometric anchor)
// Manual screen-space nudge applied to the logo + flare + beam as ONE group (screen px,
// +y = down). Live-tune in the browser: add ?dy=<px> and/or ?dx=<px> to the URL, or add
// ?tune to nudge with the arrow keys (Shift = ±10) and read the value off the on-screen HUD.
const HERO_DX = 0;
const HERO_DY = -4;    // LOGO offset — Alex confirmed perfect, do not touch.
// FLARE/BEAM (WebGL shader) offset, applied to the shader anchor ONLY — independent of the
// logo. +x = right, +y = down (screen px). Live-tune: ?fdx=<px> / ?fdy=<px>, or ?tune + arrow
// keys (Shift ±10). The logo's own baked flare stays; this moves only the shader flare/beam.
const FLARE_DX = 8;
const FLARE_DY = 26;   // eyeballed by Alex on the live render — seats the shader flare/beam on the earth beacon point
const MAIN_HZ_FX = 0.500, MAIN_HZ_FY = 0.510;       // logo's baked horizon apex
const MAIN_FLARE_FX = 0.596, MAIN_FLARE_FY = 0.501; // logo's flare/beacon crossing (where the shader lands)

export default function HeroStage() {
  const progress = useMotionValue(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1280, h: 800 });
  // Drop the fixed logo layer from the tree once the dock completes — an invisible
  // full-screen mix-blend layer still costs the compositor every frame (PERF-NOTES).
  const [logoLive, setLogoLive] = useState(true);
  // Live alignment nudge (see HERO_DX/HERO_DY). Read once from the URL on mount.
  // Live FLARE nudge (the shader flare/beam only — the logo is locked). Read once from URL.
  const [tune, setTune] = useState(() => {
    if (typeof window === "undefined") return { dx: FLARE_DX, dy: FLARE_DY, on: false };
    const q = new URLSearchParams(window.location.search);
    return {
      dx: q.has("fdx") ? parseFloat(q.get("fdx") || "") || 0 : FLARE_DX,
      dy: q.has("fdy") ? parseFloat(q.get("fdy") || "") || 0 : FLARE_DY,
      on: q.has("tune"),
    };
  });

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const onSize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    onSize();
    window.addEventListener("resize", onSize);

    // Broadcast hero progress so the header can hold its corner logo back until the dock lands.
    const emit = (v: number) => {
      window.dispatchEvent(new CustomEvent("bhi:hero-progress", { detail: v }));
      setLogoLive(v < 0.995); // unmount the blend layer after dock; restores on scroll-up
    };
    const unsubEmit = progress.on("change", emit);

    const frozen = new URLSearchParams(window.location.search).get("p");
    if (frozen !== null) {
      progress.set(Math.min(1, Math.max(0, parseFloat(frozen) || 0)));
      emit(progress.get());
      return () => {
        unsubEmit();
        window.removeEventListener("resize", onSize);
      };
    }

    window.scrollTo(0, 0);
    const update = () => {
      const el = heroRef.current;
      if (!el) return;
      const denom = el.offsetHeight - window.innerHeight;
      const p = denom > 0 ? (window.scrollY - el.offsetTop) / denom : 0;
      progress.set(Math.min(1, Math.max(0, p)));
    };
    update();
    emit(progress.get());
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      unsubEmit();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("resize", onSize);
    };
  }, [progress]);

  // Arrow-key nudging when ?tune is on — for eyeballing the alignment live.
  useEffect(() => {
    if (!tune.on) return;
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 2;
      let dx = 0, dy = 0;
      if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else return;
      e.preventDefault();
      setTune((t) => ({ ...t, dx: t.dx + dx, dy: t.dy + dy }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tune.on]);

  // The planet is scaled DOWN at rest ("backs out") so its rim curvature matches the tighter
  // logo horizon. Tune REST_SCALE to fit; the logo anchors to the scaled rim apex.
  const REST_SCALE = 0.36;

  // Cover transform → planet rim apex, then apply the rest scale (about screen centre).
  const s = Math.max(size.w / SRC_W, size.h / SRC_H);
  const cx = size.w / 2, cy = size.h / 2;
  const rawApexX = (size.w - SRC_W * s) / 2 + RIM_APEX.x * s;
  const rawApexY = (size.h - SRC_H * s) / 2 + RIM_APEX.y * s;
  const apexX = cx + REST_SCALE * (rawApexX - cx) + HERO_DX;
  const apexY = cy + REST_SCALE * (rawApexY - cy) + HERO_DY;

  const mainW = Math.min(940, size.w * 0.9);
  // Place the full logo so its baked horizon apex sits on the planet rim apex.
  const mainLeft = apexX - MAIN_HZ_FX * mainW;
  const mainTop = apexY - MAIN_HZ_FY * mainW;
  // Beacon point = where the logo's flare lands → the shader flare is pinned here, and it's the dock target.
  const beaconX = mainLeft + MAIN_FLARE_FX * mainW;
  const beaconY = mainTop + MAIN_FLARE_FY * mainW;

  // Dock target = the header logo's flare point, so the hero mark flies up, shrinks to EXACTLY the
  // header symbol's size, and dissolves into it — the mark literally takes its place.
  // Header geometry: centered max-w-7xl (1280px) container, px-8 pad, h-20 bar, h-12 symbol.
  // Symbol image = logo-main cropped to x∈[0.20,0.80], y∈[0.055,0.70] → flare sits at (0.660, 0.6915)
  // of the crop; symbol aspect = 753/809.
  const headerSymW = 48 * (753 / 809);
  const dockTargetX = Math.max((size.w - 1280) / 2, 0) + 32 + 0.660 * headerSymW;
  const dockTargetY = (80 - 48) / 2 + 0.6915 * 48;
  const dockScale = headerSymW / (0.6 * mainW); // hero symbol width (0.6·logo) → header symbol width

  const planet = useTransform(progress, [0, 0.22], [0, 1]);
  const planetScale = useTransform(progress, [0.06, 0.26], [1, REST_SCALE]); // rise full, then back out
  const darkOpacity = useTransform(progress, [0.22, 0.42], [0, 0.92]);
  // Fade in as it resolves, then fade OUT at the end of the dock as the crisp header logo takes over.
  const mainOpacity = useTransform(progress, [0.58, 0.72, 0.90, 1.0], [0, 1, 1, 0]);
  const mainScale = useTransform(progress, [0.86, 1.0], [1, dockScale]);
  const dockX = useTransform(progress, [0.86, 1.0], [0, dockTargetX - beaconX]);
  const dockY = useTransform(progress, [0.86, 1.0], [0, dockTargetY - beaconY]);
  const hintOpacity = useTransform(progress, [0, 0.1], [1, 0]);

  return (
    <section ref={heroRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#01030a]">
        <Particles />
        <PlanetSequence progress={planet} scale={planetScale} />

        {/* Deep near-black wash — sinks the planet so the beacon flare pops. */}
        <motion.div className="pointer-events-none absolute inset-0 bg-[#010207]" style={{ opacity: darkOpacity }} />

        {/* WebGL beacon — the glowing flare + beam that ignite at the beacon point; dissolves as the logo resolves. */}
        <ShaderBeacon progress={progress} anchor={{ x: (beaconX + tune.dx) / size.w, y: 1 - (beaconY + tune.dy) / size.h }} />

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 75% 65% at 50% 46%, transparent 45%, rgba(0,1,6,0.55) 100%)" }}
        />

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-500"
          style={{ opacity: hintOpacity }}
        >
          <span>Scroll</span>
          <span className="h-8 w-px animate-pulse bg-gradient-to-b from-[#58d6ff] to-transparent" />
        </motion.div>
      </div>

      {/* Logo rides its OWN fixed layer (z-[8]) so it stays in front of the master
          planet video (z-[6]) that fades up over the hero during the reveal — only
          the logo is above the incoming video; everything else crossfades beneath it.
          Coords are viewport-based (the stage fills the viewport), so fixed works.
          It fades to 0 by heroP=1 as the crisp header logo takes over. */}
      {/* screen-blend lives on the WRAPPER: the fixed layer is its own stacking
          context, so a blend on the img would only see the (empty) wrapper and the
          logo's black plate would stop dropping out. Blending the whole layer
          composites it against the page below — black vanishes, logo stays. */}
      {logoLive && <div className="pointer-events-none fixed inset-0 z-[8]" style={{ mixBlendMode: "screen" }}>
        <motion.img
          src="/brand/logo-main.webp" alt="Blue Horizon Interactive" draggable={false}
          className="pointer-events-none absolute select-none"
          style={{
            left: mainLeft, top: mainTop, width: mainW,
            opacity: mainOpacity, x: dockX, y: dockY, scale: mainScale,
            transformOrigin: `${MAIN_FLARE_FX * 100}% ${MAIN_FLARE_FY * 100}%`,
          }}
        />
      </div>}
      {tune.on && (
        <div className="fixed left-3 top-3 z-[100] rounded-md bg-black/85 px-3 py-2 font-mono text-xs leading-relaxed text-bh-cyan ring-1 ring-bh-cyan/30">
          <div>FLARE align · arrows nudge (Shift ±10)</div>
          <div className="text-sm text-white">fdx={tune.dx}&nbsp;&nbsp;fdy={tune.dy}</div>
          <div className="text-slate-400">tell me: FLARE_DX={tune.dx} FLARE_DY={tune.dy}</div>
        </div>
      )}
    </section>
  );
}
