import { useState } from "react";
import { Chip } from "../ui/Chip";
import { EmptyState } from "../ui/States";
import { ProductCard } from "../cards/ProductCard";
import { PRODUCTS, type ProductCategory } from "../../lib/data";

const CATEGORIES: ProductCategory[] = ["Blender Plugins", "Tools & Scripts", "3D Assets"];

type Sort = "newest" | "price-asc" | "price-desc";

// Marketplace browse surface — category chips + sort over the full catalogue.
// (The flagship spotlight lives in the page hero now, so no featured banner here.)
export function MarketGrid() {
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [sort, setSort] = useState<Sort>("newest");

  // ponytail: "newest" = catalogue order (curated newest-first in data.ts);
  // switch to a real date sort when products carry a releasedAt field.
  let items = PRODUCTS.filter((p) => category === "All" || p.category === category);
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
