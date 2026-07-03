import { Video, Heart, Camera, Music2, ShoppingBag, Hexagon, Box, Rocket, MessageCircle, Sparkles, Globe } from "lucide-react";
import { PLATFORM_META, type Platform } from "../../lib/data";

// lucide dropped brand glyphs — generic stand-ins keyed by platform (color + label carry identity).
const ICONS: Record<Platform | "web", typeof Video> = {
  youtube: Video,
  patreon: Heart,
  instagram: Camera,
  tiktok: Music2,
  gumroad: ShoppingBag,
  superhive: Hexagon,
  fab: Box,
  kickstarter: Rocket,
  discord: MessageCircle,
  bhi: Sparkles,
  web: Globe,
};

/** Small source pill — every card in the hub carries one so origin is always legible. */
export function PlatformBadge({ platform, className = "" }: { platform: Platform; className?: string }) {
  const meta = PLATFORM_META[platform];
  const Icon = ICONS[platform];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium ${className}`}
      style={{ color: meta.color }}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {meta.label}
    </span>
  );
}

/** Bare platform icon (Connect rows, artist socials). */
export function PlatformIcon({ platform, className = "h-4 w-4" }: { platform: Platform | "web"; className?: string }) {
  const Icon = ICONS[platform];
  return <Icon className={className} aria-hidden />;
}
