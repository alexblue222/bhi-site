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
  // Decode-pinned frame buffer: ImageBitmaps are GPU-ready and immune to the
  // browser's decoded-image cache eviction (the pause->resume freeze source).
  // A sliding window around the playhead stays decoded; the rest is released.
  const bmpRef = useRef<Map<number, ImageBitmap>>(new Map());
  const pendingRef = useRef<Set<number>>(new Set());
  const currentRef = useRef(-1);
  const drawRef = useRef<(idx: number) => void>(() => {});
  const alignRef = useRef({ x: offsetX, y: offsetY, s: scale });

  // (Re)load the sequence + wire resize whenever the scene's frame source changes.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const ready = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    const pick = (i: number): ImageBitmap | HTMLImageElement | undefined => {
      const b = bmpRef.current.get(i);
      if (b) return b;
      const el = imgsRef.current[i];
      return ready(el) ? el : undefined;
    };
    // Fractional index: cross-fade the two neighbouring frames so slow scrubs
    // (the handoff roll-out especially) glide between published frames instead
    // of stepping; at speed the blend reads as motion blur.
    const draw = (fidx: number) => {
      const i0 = Math.max(0, Math.floor(fidx));
      const t = Math.min(1, Math.max(0, fidx - i0));
      let img = pick(i0);
      if (!img) {
        for (let k = 1; k <= 12 && !img; k++) img = pick(i0 - k) ?? pick(i0 + k);
        if (!img) return;
      }
      const next = t > 0.02 ? pick(i0 + 1) : undefined;
      const iw = img instanceof ImageBitmap ? img.width : img.naturalWidth;
      const ih = img instanceof ImageBitmap ? img.height : img.naturalHeight;
      const cw = window.innerWidth, ch = window.innerHeight;
      const a = alignRef.current;
      const s = Math.max(cw / iw, ch / ih) * a.s;
      const w = iw * s, h = ih * s;
      const cx = cw / 2 + a.x, cy = ch / 2 + a.y;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
      if (next) {
        ctx.globalAlpha = t;
        ctx.drawImage(next, cx - w / 2, cy - h / 2, w, h);
        ctx.globalAlpha = 1;
      }
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

  // Redraw on scroll-progress change + maintain the decode-pinned window.
  useEffect(() => {
    const fidx = Math.min(frameCount - 1, Math.max(0, progress * (frameCount - 1)));
    const idx = Math.round(fidx); // integer anchor for the bitmap window
    currentRef.current = fidx;    // draw uses the fraction to cross-fade
    drawRef.current(fidx);
    // Sliding bitmap window: generous ahead (scroll direction is usually down),
    // some behind. Primed from progress 0, so the opening buffer decodes during
    // the hero — the "loading screen" without a loading screen.
    const lo = idx - 24, hi = idx + 48;
    const bmps = bmpRef.current, pending = pendingRef.current;
    for (const [k, b] of bmps) {
      if (k < lo || k > hi) { b.close(); bmps.delete(k); }
    }
    for (let k = Math.max(0, lo); k <= Math.min(frameCount - 1, hi); k++) {
      if (bmps.has(k) || pending.has(k)) continue;
      const img = imgsRef.current[k];
      if (!img || !img.complete || !img.naturalWidth) continue;
      pending.add(k);
      createImageBitmap(img).then((b) => {
        pending.delete(k);
        const cur = currentRef.current;
        if (k < cur - 24 || k > cur + 48) { b.close(); return; } // window moved on
        bmps.set(k, b);
        if (Math.abs(k - cur) < 1) drawRef.current(cur); // upgrade the visible frame in place
      }).catch(() => pending.delete(k));
    }
  }, [progress, frameCount]);

  // Release all pinned bitmaps on unmount.
  useEffect(() => () => {
    for (const [, b] of bmpRef.current) b.close();
    bmpRef.current.clear();
  }, []);

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
