import { useEffect, useRef } from "react";

// Section-scoped sibling of hero/PlanetSequence.tsx — same WebP-sequence-on-canvas,
// screen-blend compositing trick, but driven by a plain 0..1 number (HomeScenes already
// computes per-section scroll progress via rAF, no MotionValue plumbing needed here)
// and parameterised per scene (frame folder + count) instead of the hero's fixed 95.
//
// offsetX/offsetY (px) + scale shift the drawn plate — used to line the master
// render's first frame up with the hero's final Earth (tuned live via ?edit).
export function ScenePlanetSequence({
  progress,
  srcBase,
  frameCount,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  filter = "brightness(0.68) contrast(1.22) saturate(1.1)",
}: {
  progress: number;
  srcBase: string;
  frameCount: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  filter?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgsRef = useRef<HTMLImageElement[]>([]);
  const currentRef = useRef(-1);
  const drawRef = useRef<(idx: number) => void>(() => {});
  const alignRef = useRef({ x: offsetX, y: offsetY, s: scale });

  // (Re)load the sequence + wire resize whenever the scene's frame source changes.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const ready = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    const draw = (idx: number) => {
      let img = imgsRef.current[idx];
      if (!ready(img)) {
        // Nearest loaded neighbour instead of freezing on a stale frame while
        // the sequence is still streaming in.
        for (let k = 1; k <= 12; k++) {
          const back = imgsRef.current[idx - k], fwd = imgsRef.current[idx + k];
          if (ready(back)) { img = back; break; }
          if (ready(fwd)) { img = fwd; break; }
        }
        if (!ready(img)) return;
      }
      const cw = window.innerWidth, ch = window.innerHeight;
      const a = alignRef.current;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * a.s;
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      const cx = cw / 2 + a.x, cy = ch / 2 + a.y;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      // Feather the plate edges so the planet floats (see hero/PlanetSequence.tsx).
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.translate(cx, cy);
      ctx.scale(1, h / w);
      const grd = ctx.createRadialGradient(0, 0, w * 0.30, 0, 0, w * 0.52);
      grd.addColorStop(0, "rgba(0,0,0,1)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(-w, -w, 2 * w, 2 * w);
      ctx.restore();
    };
    drawRef.current = draw;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (currentRef.current >= 0) draw(currentRef.current);
    };

    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = `${srcBase}/frame_${String(i + 1).padStart(4, "0")}.webp`;
      img.onload = () => { if (i === currentRef.current) draw(i); };
      imgs[i] = img;
    }
    imgsRef.current = imgs;

    window.addEventListener("resize", resize);
    resize();

    return () => window.removeEventListener("resize", resize);
  }, [srcBase, frameCount]);

  // Redraw on scroll-progress change.
  useEffect(() => {
    const idx = Math.min(frameCount - 1, Math.max(0, Math.round(progress * (frameCount - 1))));
    currentRef.current = idx;
    drawRef.current(idx);
    // Warm the decode cache around the playhead: after a scroll pause the browser
    // evicts decoded bitmaps, and stacked synchronous re-decodes on resume caused
    // the stuck-then-jump. Async decode() keeps the neighbourhood hot both ways.
    // (?nowarm disables this for perf bisection)
    if (!location.search.includes("nowarm")) {
      const imgs = imgsRef.current;
      for (let k = 1; k <= 5; k++) {
        imgs[idx + k]?.decode?.().catch(() => {});
        imgs[idx - k]?.decode?.().catch(() => {});
      }
    }
  }, [progress, frameCount]);

  // Redraw when alignment changes (live tuning).
  useEffect(() => {
    alignRef.current = { x: offsetX, y: offsetY, s: scale };
    if (currentRef.current >= 0) drawRef.current(currentRef.current);
  }, [offsetX, offsetY, scale]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ mixBlendMode: "screen", filter }}
    />
  );
}
