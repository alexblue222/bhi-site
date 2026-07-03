// ─── GSAP setup — client-only. Import gsap/ScrollTrigger from here, nowhere else,
// so the plugin is registered exactly once. ───────────────────────────────────
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Fade + rise (24px) with stagger when the first target scrolls into view.
 * Fires once. Reduced motion → elements are shown instantly, no tween.
 * `opts` overrides any tween var (y, duration, stagger, …) plus `start`.
 */
export function revealUp(
  targets: gsap.TweenTarget,
  opts: gsap.TweenVars & { start?: string } = {},
): gsap.core.Tween | undefined {
  const els = gsap.utils.toArray(targets) as Element[];
  if (!els.length) return;

  if (prefersReducedMotion()) {
    gsap.set(els, { opacity: 1, y: 0, clearProps: "opacity,transform" });
    return;
  }

  const { start = "top 85%", ...vars } = opts;
  return gsap.from(els, {
    opacity: 0,
    y: 24,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: { trigger: els[0], start, once: true },
    ...vars,
  });
}
