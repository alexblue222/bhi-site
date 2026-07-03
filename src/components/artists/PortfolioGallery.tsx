import { useState } from "react";
import { EmptyState } from "../ui/States";
import type { PortfolioPiece } from "../../lib/data";

type GalleryPiece = PortfolioPiece & { image?: string };

// Amber-active variant of ui/Chip — artists are the human surface, so the
// filter accent goes warm here instead of the system blue. (Chip is shared
// read-only; this stays local to the gallery.)
function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-bh-amber/60 bg-bh-amber/15 text-bh-amber"
          : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

// Per-artist portfolio: medium filter over a masonry-ish grid. Tiles show the
// CMS image when one exists, else the tint gradient + sheen vocabulary
// (see MediaTile) — built inline because they live on auto-rows, not an aspect box.
export function PortfolioGallery({ pieces }: { pieces: GalleryPiece[] }) {
  const mediums = [...new Set(pieces.map((p) => p.medium))];
  const [filter, setFilter] = useState<"All" | PortfolioPiece["medium"]>("All");
  const shown = filter === "All" ? pieces : pieces.filter((p) => p.medium === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "All"} onClick={() => setFilter("All")}>All</FilterChip>
        {mediums.map((m) => (
          <FilterChip key={m} active={filter === m} onClick={() => setFilter(m)}>{m}</FilterChip>
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
              {p.image ? (
                <img src={p.image} alt={p.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div
                  className="absolute inset-0 opacity-35 mix-blend-screen"
                  style={{ background: "radial-gradient(130% 90% at 20% 0%, rgba(255,255,255,0.4), transparent 55%)" }}
                />
              )}
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
