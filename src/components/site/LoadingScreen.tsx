import { useEffect, useState } from "react";

// Full-screen branded loader shown ONLY on the homepage (the heavy surface). It holds
// the curtain while every master planet frame downloads, so the scroll-scrub never
// stalls fetching a frame mid-scroll. Frames warm the browser's HTTP cache here; the
// per-frame decode window still lives in ScenePlanetSequence. Renders server-side (Astro
// client:load) so it covers the page on first paint — no flash of an unstyled hero.

const BASE = "/planets/master";
const COUNT = 600;                 // matches MASTER.frameCount in HomeScenes
const FADE_MS = 700;
const HARD_TIMEOUT_MS = 20000;     // never hang forever (slow/offline)

export function LoadingScreen() {
  const [pct, setPct] = useState(0);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let finished = false;
    let loaded = 0;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock scroll behind the curtain

    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      setFading(true);
      window.setTimeout(() => {
        document.body.style.overflow = prevOverflow;
        setGone(true);
        window.dispatchEvent(new Event("bhi:loaded"));
      }, FADE_MS);
    };

    const bump = () => {
      loaded += 1;
      setPct((p) => Math.max(p, Math.min(99, Math.round((loaded / COUNT) * 100))));
      if (loaded >= COUNT) finish();
    };

    // Fire all frame requests — HTTP/2 multiplexes; each onload warms the cache. We don't
    // keep the Image refs (600 decoded 720p bitmaps would blow up memory) — the download
    // is the win, the decode window handles the rest.
    for (let i = 1; i <= COUNT; i++) {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump; // a missing frame shouldn't wedge the loader
      img.src = `${BASE}/frame_${String(i).padStart(4, "0")}.webp`;
    }

    const t = window.setTimeout(finish, HARD_TIMEOUT_MS);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#01030a] transition-opacity"
      style={{ opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms`, pointerEvents: fading ? "none" : "auto" }}
    >
      {/* soft beacon glow behind the mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(46,155,255,0.16), rgba(46,155,255,0.04) 40%, transparent 70%)" }}
      />
      <img
        src="/brand/logo-main.webp"
        alt="Blue Horizon Interactive"
        draggable={false}
        className="relative w-[min(420px,72vw)] select-none"
        style={{ mixBlendMode: "screen" }}
      />
      <div className="relative mt-10 h-[2px] w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#58d6ff] to-[#2e9bff]"
          style={{ width: `${pct}%`, transition: "width 300ms ease-out" }}
        />
      </div>
      <p className="relative mt-3 font-mono text-[11px] uppercase tracking-[0.35em] text-slate-500">
        {pct < 100 ? `Loading the horizon · ${pct}%` : "Ready"}
      </p>
    </div>
  );
}
