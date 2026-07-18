import { ExternalLink } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { MediaTile } from "../ui/MediaTile";
import { formatPrice, getArtist, type Product } from "../../lib/data";

// Marketplace grid card — same glass family as the feed. Price is always visible;
// coming-soon and free states are first-class.
export function ProductCard({ product }: { product: Product }) {
  const artist = getArtist(product.maker);
  return (
    <GlassCard href={`/marketplace/${product.slug}`} className="flex h-full flex-col">
      <MediaTile tint={product.thumbTint} aspect="video" className="rounded-b-none">
        {product.gallery[0]?.image && (
          <img src={product.gallery[0].image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {product.status === "coming-soon" && (
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-200 backdrop-blur-sm">
            Coming soon
          </span>
        )}
        {product.price === 0 && product.status === "available" && (
          <span className="absolute left-3 top-3 rounded-full bg-bh-cyan/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">Free</span>
        )}
        {product.buyMode === "external" && (
          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm" title={product.externalLabel}>
            <ExternalLink className="h-3 w-3 text-slate-300" aria-hidden />
          </span>
        )}
      </MediaTile>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bh-cyan/80">{product.category}</p>
        <h3 className="mt-1 font-semibold text-slate-100">{product.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">{product.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-semibold text-slate-100">{formatPrice(product.price)}</span>
          {artist && <span className="text-xs text-slate-500">by {artist.name}</span>}
        </div>
      </div>
    </GlassCard>
  );
}
