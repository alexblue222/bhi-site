import { useEffect, useRef, useState } from "react";
import { scrollTo } from "../../lib/smoothScroll";

// ── The beam-spine ────────────────────────────────────────────────────────────
// An electric-blue vertical beam that, during the hero dock, descends and slides to
// the right edge — becoming the persistent roadmap-style nav spine. Its intro motion
// is driven by hero progress (bhi:hero-progress, 0..1) through KEYFRAMES that Alex
// authors by eye with the built-in capture editor (add ?edit to the URL).
//
// Editor keys (?edit): ←→ move x · ↑↓ draw (grow down) · [ ] opacity · C capture a
// keyframe at the current scroll point · P toggle preview (scrub the captured anim) ·
// Z undo · X clear · K copy all keyframes to clipboard (paste them to me to bake in).

type KF = { p: number; xf: number; o: number; draw: number };

// Default intro keyframes — a starting guess. Alex refines with ?edit, hits K, and I
// paste the result here. xf = x as fraction of viewport width · o = opacity · draw =
// vertical draw 0..1 (the beam growing downward).
// Authored by Alex in the ?edit tool: beam draws down the centre, then peels right
// into the resting spine. (draw=0 = invisible, so it stays hidden until p≈0.46.)
const SPINE_KF: KF[] = [
  { p: 0.0, xf: 0.549, o: 1, draw: 0 },
  { p: 0.461, xf: 0.549, o: 1, draw: 0 },
  { p: 0.576, xf: 0.549, o: 1, draw: 0.58 },
  { p: 0.691, xf: 0.549, o: 1, draw: 0.74 },
  { p: 0.806, xf: 0.549, o: 1, draw: 0.8 },
  { p: 0.921, xf: 0.737, o: 1, draw: 1 },
  { p: 1.0, xf: 0.925, o: 1, draw: 1 },
];

const CYAN = "#58d6ff";

function sample(kfs: KF[], p: number): KF {
  if (!kfs.length) return { p, xf: 0.965, o: 1, draw: 1 };
  if (p <= kfs[0].p) return kfs[0];
  const last = kfs[kfs.length - 1];
  if (p >= last.p) return last;
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i], b = kfs[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / (b.p - a.p || 1);
      return { p, xf: a.xf + (b.xf - a.xf) * t, o: a.o + (b.o - a.o) * t, draw: a.draw + (b.draw - a.draw) * t };
    }
  }
  return last;
}

function NodeGlyph({ active }: { active: boolean }) {
  return (
    <span
      className="relative block h-5 w-5 rounded-full transition-all duration-300"
      style={{
        background: "radial-gradient(circle, rgba(88,214,255,0.95) 0%, rgba(88,214,255,0.22) 40%, transparent 70%)",
        boxShadow: active ? "0 0 16px 3px rgba(88,214,255,0.85)" : "0 0 7px rgba(88,214,255,0.4)",
        transform: active ? "scale(1.25)" : "scale(1)",
      }}
    >
      <span className="absolute inset-0 rounded-full border" style={{ borderColor: active ? "#a9ecff" : "rgba(88,214,255,0.55)" }} />
      <span
        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: active ? "#d6f5ff" : CYAN }}
      />
    </span>
  );
}

export default function Spine() {
  const edit = typeof window !== "undefined" && new URLSearchParams(location.search).has("edit");

  const [nodes, setNodes] = useState<{ label: string; el: HTMLElement }[]>([]);
  const [active, setActive] = useState(0);
  const [frame, setFrame] = useState<KF>(SPINE_KF[0]);

  const [live, setLive] = useState({ xf: 0.965, o: 1, draw: 1 });
  const [preview, setPreview] = useState(false);
  const [kfs, setKfs] = useState<KF[]>(SPINE_KF);
  const pRef = useRef(0);
  const [hud, setHud] = useState({ p: 0, msg: "" });

  // Collect section anchors from the DOM (decoupled from HubSections).
  useEffect(() => {
    // Clean node labels by section order (homepage: Feed · Games · Artists · Connect);
    // falls back to a trimmed heading for any extra sections.
    const LABELS = ["Feed", "Games", "Artists", "Connect"];
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    setNodes(secs.map((el, i) => ({ label: LABELS[i] ?? ((el.querySelector("h2")?.textContent || "").trim().slice(0, 14) || "Section"), el })));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = secs.indexOf(e.target as HTMLElement);
          if (idx >= 0) setActive(idx);
        }
      }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Hero progress drives the intro motion (or, in edit+preview, the scrubbed playback).
  useEffect(() => {
    const onP = (e: Event) => {
      const p = (e as CustomEvent<number>).detail ?? 0;
      pRef.current = p;
      if (edit) setHud((h) => ({ ...h, p }));
      if (!edit || preview) setFrame(sample(kfs, p));
    };
    window.addEventListener("bhi:hero-progress", onP as EventListener);
    return () => window.removeEventListener("bhi:hero-progress", onP as EventListener);
  }, [kfs, edit, preview]);

  // In edit "position" mode the beam follows the live manual values.
  useEffect(() => {
    if (edit && !preview) setFrame({ p: pRef.current, ...live });
  }, [edit, preview, live]);

  // Restore any saved keyframes when entering the editor.
  useEffect(() => {
    if (!edit) return;
    try {
      const saved = localStorage.getItem("bhi-spine-kf");
      if (saved) setKfs(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [edit]);

  // Editor keys.
  useEffect(() => {
    if (!edit) return;
    const onKey = (e: KeyboardEvent) => {
      const big = e.shiftKey;
      const k = e.key.toLowerCase();
      let handled = true;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "[" || e.key === "]") {
        const sx = big ? 0.02 : 0.004;
        const sd = big ? 0.1 : 0.02;
        setLive((l) => {
          const n = { ...l };
          if (e.key === "ArrowRight") n.xf = Math.min(1, l.xf + sx);
          else if (e.key === "ArrowLeft") n.xf = Math.max(0, l.xf - sx);
          else if (e.key === "ArrowUp") n.draw = Math.min(1, l.draw + sd);
          else if (e.key === "ArrowDown") n.draw = Math.max(0, l.draw - sd);
          else if (e.key === "]") n.o = Math.min(1, l.o + 0.05);
          else if (e.key === "[") n.o = Math.max(0, l.o - 0.05);
          return n;
        });
      } else if (k === "c") {
        setKfs((prev) => {
          const p = +pRef.current.toFixed(3);
          const kf: KF = { p, xf: +live.xf.toFixed(4), o: +live.o.toFixed(3), draw: +live.draw.toFixed(3) };
          const next = [...prev.filter((x) => Math.abs(x.p - p) > 0.002), kf].sort((a, b) => a.p - b.p);
          try { localStorage.setItem("bhi-spine-kf", JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });
        setHud((h) => ({ ...h, msg: `captured @ p=${pRef.current.toFixed(3)}` }));
      } else if (k === "z") {
        setKfs((prev) => prev.slice(0, -1));
      } else if (k === "p") {
        setPreview((v) => !v);
      } else if (k === "k") {
        navigator.clipboard?.writeText(JSON.stringify(kfs));
        setHud((h) => ({ ...h, msg: `copied ${kfs.length} keyframes → paste to Claude` }));
      } else if (k === "x") {
        setKfs([]);
        try { localStorage.removeItem("bhi-spine-kf"); } catch { /* ignore */ }
      } else {
        handled = false;
      }
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [edit, live, kfs]);

  // Nodes fade in ONLY as the spine settles into its final right position (xf 0.86→0.925),
  // so they don't show during the descend/slide. Scroll-linked, not a delayed CSS transition.
  const nodeOpacity = Math.max(0, Math.min(1, (frame.xf - 0.86) / (0.925 - 0.86)));

  return (
    <>
      {/* the beam */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 z-40 w-[3px] -translate-x-1/2"
        style={{
          left: `${frame.xf * 100}vw`,
          height: `${frame.draw * 100}vh`,
          opacity: frame.o,
          background: `linear-gradient(to bottom, transparent, ${CYAN} 10%, #2e9bff 85%, transparent)`,
          boxShadow: "0 0 18px 1px rgba(88,214,255,0.5)",
        }}
      />

      {/* roadmap nodes — fade in once the spine has formed on the right */}
      {nodes.length > 0 && (
        <div
          className="fixed top-0 z-40 h-screen"
          style={{ left: `${frame.xf * 100}vw`, opacity: nodeOpacity, pointerEvents: nodeOpacity > 0.5 ? "auto" : "none" }}
        >
          {nodes.map((n, i) => {
            const top = nodes.length > 1 ? 22 + (i * 56) / (nodes.length - 1) : 50;
            return (
              <button
                key={i}
                onClick={() => scrollTo(n.el, { offset: -80 })}
                style={{ top: `${top}vh` }}
                className="group absolute left-0 -translate-x-1/2 -translate-y-1/2"
                aria-label={n.label}
              >
                <span
                  className="absolute right-full top-1/2 mr-4 -translate-y-1/2 whitespace-nowrap font-display text-[11px] uppercase tracking-[0.22em] transition-all duration-300 group-hover:opacity-100"
                  style={{ color: active === i ? "#a9ecff" : "rgba(148,163,184,0.8)", opacity: active === i ? 1 : 0.45 }}
                >
                  {n.label}
                </span>
                <NodeGlyph active={active === i} />
              </button>
            );
          })}
        </div>
      )}

      {/* editor HUD */}
      {edit && (
        <div className="fixed bottom-3 left-3 z-[100] max-w-md rounded-md bg-black/85 px-3 py-2 font-mono text-[11px] leading-relaxed text-bh-cyan ring-1 ring-bh-cyan/30">
          <div className="text-sm text-white">SPINE editor · {preview ? "PREVIEW (scrub to play)" : "POSITION"}</div>
          <div>scroll-point p={hud.p.toFixed(3)} · xf={live.xf.toFixed(3)} o={live.o.toFixed(2)} draw={live.draw.toFixed(2)}</div>
          <div className="text-slate-400">←→ x · ↑↓ draw · [ ] opacity · C capture · P preview · Z undo · X clear · K copy</div>
          <div>keyframes: {kfs.length}{kfs.length ? " @ p=" + kfs.map((x) => x.p.toFixed(2)).join(", ") : ""}</div>
          {hud.msg && <div className="text-green-400">{hud.msg}</div>}
        </div>
      )}
    </>
  );
}
