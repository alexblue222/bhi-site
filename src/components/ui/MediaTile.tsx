import type { ReactNode } from "react";

const ASPECTS = { video: "aspect-video", square: "aspect-square", wide: "aspect-[21/9]" } as const;

// Gradient media placeholder — the site-wide stand-in until real thumbnails/art land.
// Same visual vocabulary as the original demo tiles: brand-blue gradient + top-left sheen.
export function MediaTile({
  tint,
  label,
  aspect = "video",
  className = "",
  children,
}: {
  tint: string;
  label?: string;
  aspect?: keyof typeof ASPECTS;
  className?: string;
  children?: ReactNode; // overlays: play button, duration chip, lock…
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${tint} ${ASPECTS[aspect]} ${className}`}>
      <div
        className="absolute inset-0 opacity-35 mix-blend-screen"
        style={{ background: "radial-gradient(130% 90% at 20% 0%, rgba(255,255,255,0.4), transparent 55%)" }}
      />
      {label && <span className="absolute bottom-2.5 left-3 text-xs font-medium text-white/80 drop-shadow">{label}</span>}
      {children}
    </div>
  );
}
