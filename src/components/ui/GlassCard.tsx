import type { ReactNode } from "react";

// THE card of the design system — one glass surface used by feed, marketplace and artists,
// so the whole hub reads as a single family. Amber glow is reserved for human/community surfaces.
export function GlassCard({
  href,
  glow = "cyan",
  className = "",
  children,
}: {
  href?: string;
  glow?: "cyan" | "amber" | "none";
  className?: string;
  children: ReactNode;
}) {
  const hover =
    glow === "amber"
      ? "hover:border-bh-amber/40 hover:shadow-[0_0_32px_-12px_rgba(255,179,71,0.35)]"
      : glow === "cyan"
        ? "hover:border-bh-blue/40 hover:shadow-[0_0_32px_-12px_rgba(46,155,255,0.45)]"
        : "";
  const base = `group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 ${hover} ${className}`;
  return href ? (
    <a href={href} className={`block ${base}`}>{children}</a>
  ) : (
    <div className={base}>{children}</div>
  );
}
