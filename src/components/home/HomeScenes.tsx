import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { scrollTo } from "../../lib/smoothScroll";
import { ScenePlanetSequence } from "./ScenePlanetSequence";

// ── Stage 3: the scroll-scene scaffold ────────────────────────────────────────
// ONE planet canvas, pinned behind ALL scenes, scrubs the entire master render
// (Blender/Unreal choreography 1–800) continuously across the whole scroll
// journey — no per-section clips, so there are no visible seams between scenes.
// Each scene section still owns its local progress, used only for its text.
//
// Master frames live in /public/planets/master (published by
// claude-scripts/scripts/bh_publish_frames.py — one render in, one sequence out).
//
// Tune the scroll length live: add ?vh=<number> to the URL (e.g. ?vh=260). Add ?edit to
// see a HUD with each scene's live progress + the current length.

type Scene = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
  accent: string;
};

const SCENES: Scene[] = [
  { id: "feed", eyebrow: "Transmissions", title: "The Feed", body: "Every video, drop and devlog — the whole signal, in one stream.", cta: { href: "/feed", label: "Open the feed" }, accent: "#58d6ff" },
  { id: "games", eyebrow: "In production", title: "The Games", body: "The interactive worlds we're building — and the tech that renders them.", cta: { href: "/games", label: "Explore the games" }, accent: "#58d6ff" },
  { id: "artists", eyebrow: "The people", title: "The Creators", body: "The artists and builders behind Blue Horizon.", cta: { href: "/artists", label: "Meet the creators" }, accent: "#ffb347" },
  { id: "connect", eyebrow: "The mission", title: "The future is not given to us. It is built.", body: "Follow along on every platform — everything we make lands here first.", cta: { href: "/contact", label: "Connect" }, accent: "#ffb347" },
];

// The whole 1–792 choreography at stride 2 (see bh_publish_frames.py "master").
const MASTER = { srcBase: "/planets/master", frameCount: 396 };

// Alignment of the master plate so frame 1 sits exactly on the hero's final Earth.
// Tune live with ?edit (arrows = move, +/- = scale, hold Shift for big steps),
// or set directly via ?px= ?py= ?ps= — then bake the numbers here.
const MASTER_ALIGN = { x: 0, y: 0, s: 1 };

const DEFAULT_VH = 220; // scroll length per scene (viewport heights)

export default function HomeScenes() {
  const [vh, setVh] = useState(DEFAULT_VH);
  const [prog, setProg] = useState<number[]>(() => SCENES.map(() => 0));
  const [masterProg, setMasterProg] = useState(0);
  const [align, setAlign] = useState(MASTER_ALIGN);
  const [edit, setEdit] = useState(false); // set client-side to avoid hydration mismatch
  const [mounted, setMounted] = useState(false); // portal target only exists client-side
  const [heroP, setHeroP] = useState<number | null>(null); // hero scroll progress (broadcast by HeroStage)
  const refs = useRef<(HTMLElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // The reveal is keyed to the hero's timeline: once the logo has fully formed
  // (heroP ≥ 0.74), the master video fades up OVER the hero; the logo alone stays
  // in front (it lives on z-[8], this layer is z-[6]).
  useEffect(() => {
    const onHero = (e: Event) => setHeroP((e as CustomEvent<number>).detail);
    window.addEventListener("bhi:hero-progress", onHero);
    return () => window.removeEventListener("bhi:hero-progress", onHero);
  }, []);

  useEffect(() => {
    setMounted(true);
    const q = new URLSearchParams(location.search);
    setEdit(q.has("edit"));
    const v = parseFloat(q.get("vh") || "");
    if (v > 40) setVh(v);
    const px = parseFloat(q.get("px") || ""), py = parseFloat(q.get("py") || ""), ps = parseFloat(q.get("ps") || "");
    setAlign((a) => ({
      x: Number.isFinite(px) ? px : a.x,
      y: Number.isFinite(py) ? py : a.y,
      s: Number.isFinite(ps) ? ps : a.s,
    }));
  }, []);

  // ?edit keyboard tuning: arrows move the master plate, +/- scales it (Shift = ×10).
  useEffect(() => {
    if (!edit) return;
    // hide the fixed site header while aligning — it covers the top of the plate
    const header = document.querySelector("header");
    const prevDisplay = header instanceof HTMLElement ? header.style.display : "";
    if (header instanceof HTMLElement) header.style.display = "none";
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 20 : 2;
      const sstep = e.shiftKey ? 0.05 : 0.005;
      let handled = true;
      setAlign((a) => {
        switch (e.key) {
          case "ArrowLeft": return { ...a, x: a.x - step };
          case "ArrowRight": return { ...a, x: a.x + step };
          case "ArrowUp": return { ...a, y: a.y - step };
          case "ArrowDown": return { ...a, y: a.y + step };
          case "+": case "=": return { ...a, s: +(a.s + sstep).toFixed(3) };
          case "-": case "_": return { ...a, s: +(a.s - sstep).toFixed(3) };
          default: handled = false; return a;
        }
      });
      if (handled && e.key.startsWith("Arrow")) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (header instanceof HTMLElement) header.style.display = prevDisplay;
    };
  }, [edit]);

  // Scroll progress, rAF-throttled: master (whole wrapper) + per-scene (text timing).
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
      const w = wrapRef.current;
      if (w) {
        const denom = w.offsetHeight - h;
        const top = w.getBoundingClientRect().top;
        setMasterProg(denom > 0 ? Math.min(1, Math.max(0, -top / denom)) : 0);
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [vh]);

  return (
    <>
      {/* ONE planet canvas on a FIXED layer (portaled to body, z-[6]): opacity 0 while
          the hero plays, fades UP over the hero once the logo has formed (heroP 0.74→0.92),
          then stays as the persistent backdrop the sections scrub. The dark backing div
          makes it a true crossfade (the canvas screen-blends against IT, not the hero).
          Only the hero logo (z-[8]) and header (z-50) sit above it; section text is z-10
          inside main, which paints later in the tree, so it stays readable on top. */}
      {mounted && createPortal(
        <div
          className="pointer-events-none fixed inset-0 z-[6] bg-[#01030a]"
          // null = hero hasn't reported yet (mount race) — stay hidden, no flash over the hero
          style={{ opacity: heroP === null ? 0 : Math.min(1, Math.max(0, (heroP - 0.74) / 0.18)) }}
        >
          <ScenePlanetSequence
            progress={masterProg}
            srcBase={MASTER.srcBase}
            frameCount={MASTER.frameCount}
            offsetX={align.x}
            offsetY={align.y}
            scale={align.s}
          />
        </div>,
        document.body,
      )}

      <div ref={wrapRef} className="relative">
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
              {/* cards alternate sides to sit in the open space opposite the planet:
                  Earth parks RIGHT for even scenes (feed, artists) and LEFT for odd
                  (games, connect) — mirrored into the master render's camera framing */}
              <div className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-10">
                <div className={i % 2 === 1 ? "max-w-md ml-auto" : "max-w-md"}>
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
      </div>

      {edit && (
        <div className="fixed bottom-3 right-3 z-[100] rounded-md bg-black/85 px-3 py-2 font-mono text-[11px] leading-relaxed text-bh-cyan ring-1 ring-bh-cyan/30">
          <div className="text-sm text-white">SCENES · spacing test</div>
          <div>length: {vh}vh/scene · total {SCENES.length * vh}vh · master p={masterProg.toFixed(3)}</div>
          <div className="text-white">align: px={align.x} py={align.y} ps={align.s}</div>
          {SCENES.map((s, i) => (
            <div key={s.id}>{s.id}: p={prog[i].toFixed(2)}</div>
          ))}
          <div className="text-slate-400">arrows move · +/- scale · shift = big steps · tell me the align values</div>
        </div>
      )}
    </>
  );
}
