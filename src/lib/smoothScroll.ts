import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsapSetup";

// Lenis smooth/clamped scroll, wired to GSAP ScrollTrigger on a single shared
// rAF loop. Inertial lerp evens out fast flicks (the "doesn't matter how fast
// you scroll" feel) and kills the momentum overshoot that made sections skip.
// Disabled under prefers-reduced-motion → native scroll. Side-effect import
// from the layout; safe to call more than once (guards against double-init).

let lenis: Lenis | undefined;

export function initSmoothScroll(): Lenis | undefined {
  if (typeof window === "undefined" || lenis) return lenis;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Reduced motion: native scroll, but still fix trigger positions after fonts.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return;
  }

  lenis = new Lenis({
    lerp: 0.1,            // 0 = instant, 1 = no smoothing; 0.1 = calm inertial glide
    wheelMultiplier: 0.9, // slightly tame fast wheel flicks
    smoothWheel: true,
  });

  // One rAF loop for both — ScrollTrigger updates off Lenis's scroll, Lenis is
  // driven by GSAP's ticker (lagSmoothing off so scrubbing stays 1:1 with scroll).
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Headings reflow when the display/body fonts finish loading, which shifts every
  // trigger's start position — recompute once so reveals fire at the right spot.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return lenis;
}

/** Smooth-scroll to a target (element, selector, or offset). Falls back to native. */
export function scrollTo(target: string | number | HTMLElement, opts?: { offset?: number; duration?: number }) {
  if (lenis) lenis.scrollTo(target, opts);
  else if (typeof target !== "number" && typeof target !== "string") {
    target.scrollIntoView({ behavior: "auto" });
  }
}
