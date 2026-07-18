import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { MediaTile } from "../ui/MediaTile";
import { Chip } from "../ui/Chip";
import { EmptyState } from "../ui/States";
import { ProductCard } from "../cards/ProductCard";
import { PRODUCTS, formatPrice, type ProductCategory } from "../../lib/data";

const CATEGORIES: ProductCategory[] = ["Blender Plugins", "Tools & Scripts", "3D Assets"];

type Sort = "newest" | "price-asc" | "price-desc";

// Marketplace browse surface — category chips + sort over the full catalogue,
// with a featured banner for the flagship product when nothing is filtered.
export function MarketGrid() {
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [sort, setSort] = useState<Sort>("newest");

  const featured = PRODUCTS[0];
  const showFeatured = category === "All";

  // ponytail: "newest" = catalogue order (curated newest-first in data.ts);
  // switch to a real date sort when products carry a releasedAt field.
  let items = PRODUCTS.filter((p) =>
    category === "All" ? p.slug !== featured.slug : p.category === category,
  );
  if (sort !== "newest") {
    items = [...items].sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Chip active={category === "All"} onClick={() => setCategory("All")}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/25 focus:border-bh-blue/60 focus:outline-none [&>option]:bg-[#0b0f16]"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price low → high</option>
            <option value="price-desc">Price high → low</option>
          </select>
        </label>
      </div>

      {/* Featured banner — hidden while a category filter is active */}
      {showFeatured && (
        <GlassCard href={`/marketplace/${featured.slug}`} className="mb-6 grid md:grid-cols-[1.1fr_1fr]">
          <MediaTile tint={featured.thumbTint} label={featured.gallery[0]?.label} aspect="video" className="rounded-none" />
          <div className="flex flex-col p-6 sm:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bh-cyan/80">
              Featured · {featured.category}
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold text-slate-100 sm:text-2xl">{featured.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{featured.tagline}</p>
            <div className="mt-auto flex items-center justify-between pt-6">
              <span className="text-2xl font-semibold text-slate-100">{formatPrice(featured.price)}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-bh-blue/40 bg-bh-blue/10 px-4 py-2 text-xs font-semibold text-[#bfe0ff] transition-colors group-hover:bg-bh-blue/20">
                View
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Grid */}
      {items.length === 0 ? (
        <EmptyState
          title="Nothing on this shelf yet"
          hint="New tools land here as they leave production — follow the feed for the drops."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
