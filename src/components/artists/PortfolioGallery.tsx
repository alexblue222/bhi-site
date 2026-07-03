import { useState } from "react";
import { Chip } from "../ui/Chip";
import { EmptyState } from "../ui/States";
import type { PortfolioPiece } from "../../lib/data";

// Per-artist portfolio: medium filter over a masonry-ish grid of gradient tiles.
// Tiles reuse the site-wide gradient + sheen vocabulary (see MediaTile) but are
// built inline because they live on the masonry auto-rows grid, not an aspect box.
export function PortfolioGallery({ pieces }: { pieces: PortfolioPiece[] }) {
  const mediums = [...new Set(pieces.map((p) => p.medium))];
  const [filter, setFilter] = useState<"All" | PortfolioPiece["medium"]>("All");
  const shown = filter === "All" ? pieces : pieces.filter((p) => p.medium === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Chip active={filter === "All"} onClick={() => setFilter("All")}>All</Chip>
        {mediums.map((m) => (
          <Chip key={m} active={filter === m} onClick={() => setFilter(m)}>{m}</Chip>
        ))}
      </div>
      {shown.length ? (
        <div className="mt-6 grid auto-rows-[140px] grid-cols-2 gap-4 sm:grid-cols-3">
          {shown.map((p) => (
            <div
              key={p.label}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${p.tint} ${p.span ?? ""}`}
              title={p.medium}
            >
              <div
                className="absolute inset-0 opacity-35 mix-blend-screen"
                style={{ background: "radial-gradient(130% 90% at 20% 0%, rgba(255,255,255,0.4), transparent 55%)" }}
              />
              <div className="absolute inset-0 transition-colors duration-300 group-hover:bg-black/30" />
              <span className="absolute bottom-2.5 left-3 text-xs font-medium text-white/80 drop-shadow">{p.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState title="Nothing in this medium yet" hint="Try another filter — more work lands here soon." />
        </div>
      )}
    </div>
  );
}
