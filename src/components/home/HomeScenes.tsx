import { useEffect, useRef, useState } from "react";
import { scrollTo } from "../../lib/smoothScroll";

// ── Stage 3: the scroll-scene scaffold ────────────────────────────────────────
// Each scene is a TALL section (ample scroll length) with a PINNED stage that houses
// a scroll-linked animation. For now that animation is a placeholder planet-orb; it's
// driven by the scene's local scroll progress (0..1), so swapping in a real Blender
// PNG sequence later is a drop-in (same `progress` input, like the hero's PlanetSequence).
// This stage is about SPACING + SCROLL FEEL — content is deliberately minimal.
//
// Tune the scroll length live: add ?vh=<number> to the URL (e.g. ?vh=260). Add ?edit to
// see a HUD with each scene's live progress + the current length.

type Scene = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
  tint: [string, string]; // [core, rim] — planet stand-in colours (Earth → warmer as we travel out)
  accent: string;
};

const SCENES: Scene[] = [
  { id: "feed", eyebrow: "Transmissions", title: "The Feed", body: "Every video, drop and devlog — the whole signal, in one stream.", cta: { href: "/feed", label: "Open the feed" }, tint: ["#0a2a6b", "#1a9fff"], accent: "#58d6ff" },
  { id: "games", eyebrow: "In production", title: "The Games", body: "The interactive worlds we're building — and the tech that renders them.", cta: { href: "/games", label: "Explore the games" }, tint: ["#141a4a", "#5b8bff"], accent: "#58d6ff" },
  { id: "artists", eyebrow: "The people", title: "The Creators", body: "The artists and builders behind Blue Horizon.", cta: { href: "/artists", label: "Meet the creators" }, tint: ["#3a1c0a", "#ff9d4d"], accent: "#ffb347" },
  { id: "connect", eyebrow: "The mission", title: "The future is not given to us. It is built.", body: "Follow along on every platform — everything we make lands here first.", cta: { href: "/contact", label: "Connect" }, tint: ["#2a1a0a", "#ffb347"], accent: "#ffb347" },
];

const DEFAULT_VH = 220; // scroll length per scene (viewport heights)

// A placeholder "planet" — a gradient sphere that rises + scales + fades with the
// scene's scroll progress. Stands in for the Blender sequence so we can feel timing.
function SceneOrb({ p, tint, accent }: { p: number; tint: [string, string]; accent: string }) {
  const y = 26 - p * 34; // +26vh (below) → -8vh (drifts up through the scene)
  const scale = 0.6 + Math.min(p / 0.55, 1) * 0.45; // 0.6 → 1.05
  const o = p < 0.14 ? p / 0.14 : p > 0.86 ? Math.max(0, (1 - p) / 0.14) : 1;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className="relative aspect-square w-[74vh] max-w-[86vw] rounded-full"
        style={{ transform: `translateY(${y}vh) translateX(6%) scale(${scale})`, opacity: o }}
      >
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 38% 33%, ${tint[1]}, ${tint[0]} 60%, #01030a 100%)`, boxShadow: `0 0 140px -20px ${accent}` }} />
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 70px -12px ${accent}, 0 0 46px -6px ${accent}` }} />
        <div className="absolute inset-0 grid place-items-center">
          <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/35">planet · placeholder</span>
        </div>
      </div>
    </div>
  );
}

export default function HomeScenes() {
  const [vh, setVh] = useState(DEFAULT_VH);
  const [prog, setProg] = useState<number[]>(() => SCENES.map(() => 0));
  const edit = typeof window !== "undefined" && new URLSearchParams(location.search).has("edit");
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const v = parseFloat(q.get("vh") || "");
    if (v > 40) setVh(v);
  }, []);

  // Per-scene local scroll progress (same pin math as the hero), rAF-throttled.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = window.innerHeight;
      setProg(refs.current.map((el) => {
        if (!el) return 0;
        const denom = el.offsetHeight - h;
        // Viewport-relative: works regardless of offsetParent. rect.top = 0 when the
        // sticky child pins at the top; goes negative through the scene's scroll length.
        const top = el.getBoundingClientRect().top;
        return denom > 0 ? Math.min(1, Math.max(0, -top / denom)) : 0;
      }));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [vh]);

  return (
    <>
      {SCENES.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          data-section
          ref={(el) => { refs.current[i] = el; }}
          className="relative"
          style={{ height: `${vh}vh` }}
        >
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            {/* the scroll-linked animation lives here (placeholder for now) */}
            <SceneOrb p={prog[i]} tint={s.tint} accent={s.accent} />

            {/* content sits in the open space on the left */}
            <div className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-10">
              <div className="max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: s.accent }}>{s.eyebrow}</p>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">{s.title}</h2>
                <p className="mt-5 max-w-sm leading-relaxed text-slate-400">{s.body}</p>
                <a
                  href={s.cta.href}
                  className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-slate-200 transition-colors hover:text-slate-50"
                  style={{ borderColor: `${s.accent}55` }}
                >
                  {s.cta.label} <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      ))}

      {edit && (
        <div className="fixed bottom-3 right-3 z-[100] rounded-md bg-black/85 px-3 py-2 font-mono text-[11px] leading-relaxed text-bh-cyan ring-1 ring-bh-cyan/30">
          <div className="text-sm text-white">SCENES · spacing test</div>
          <div>length: {vh}vh/scene · total {SCENES.length * vh}vh</div>
          {SCENES.map((s, i) => (
            <div key={s.id}>{s.id}: p={prog[i].toFixed(2)}</div>
          ))}
          <div className="text-slate-400">try ?vh=260 to change length · tell me the value</div>
        </div>
      )}
    </>
  );
}
