import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

// Scroll-scrubbed planet plate: 95 WebP frames rendered from Blender (planet on black).
// Drawn to a full-screen canvas with mix-blend-mode: screen so the black drops out and the
// planet + atmosphere glow composite additively over the starfield behind it.
// `scale` shrinks the DRAWN planet (about the canvas centre) so it "backs out" and its rim
// curvature matches the tighter logo horizon — scaling the draw (not the element) keeps the
// planet floating on transparent black with its natural falloff (no hard canvas-box edge).
const FRAME_COUNT = 95;
const src = (i: number) => `/planet/frame_${String(i + 1).padStart(4, "0")}.webp`;

export function PlanetSequence({ progress, scale }: { progress: MotionValue<number>; scale?: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const imgs: HTMLImageElement[] = [];
    let current = -1;
    let drawScale = scale ? scale.get() : 1;

    const draw = (idx: number) => {
      const img = imgs[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = window.innerWidth, ch = window.innerHeight;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * drawScale; // cover × back-out
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      // Feather the plate's edges so the planet floats — the source frame crops the planet body
      // at its borders, which otherwise reads as a hard rectangle once the plate is scaled down.
      // Radii track the drawn size, so at full scale the fade sits off-screen (no vignette).
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.translate(cw / 2, ch / 2);
      ctx.scale(1, h / w);
      const grd = ctx.createRadialGradient(0, 0, w * 0.30, 0, 0, w * 0.52);
      grd.addColorStop(0, "rgba(0,0,0,1)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(-w, -w, 2 * w, 2 * w);
      ctx.restore();
    };

    const render = (p: number) => {
      const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(p * (FRAME_COUNT - 1))));
      current = idx;
      draw(idx);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (current >= 0) draw(current);
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = src(i);
      img.onload = () => { if (i === current) draw(i); };
      imgs[i] = img;
    }

    window.addEventListener("resize", resize);
    resize();

    // Redraw synchronously on progress OR scale change (no rAF dependency).
    const unsubP = progress.on("change", (v) => render(v));
    const unsubS = scale?.on("change", (v) => { drawScale = v; if (current >= 0) draw(current); });
    render(progress.get());

    return () => {
      unsubP();
      unsubS?.();
      window.removeEventListener("resize", resize);
    };
  }, [progress, scale]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      // Deepen the darks and lift contrast — the raw plate read too bright/washed.
      style={{ mixBlendMode: "screen", filter: "brightness(0.68) contrast(1.22) saturate(1.1)" }}
    />
  );
}
