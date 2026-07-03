import { useState } from "react";
import { FEED, type FeedItem, type FeedType } from "../../lib/data";
import { FeedCard } from "../cards/FeedCard";
import { Chip } from "../ui/Chip";
import { Connect } from "../ui/Connect";
import { EmptyState, SkeletonCard } from "../ui/States";

// The centerpiece island: filterable, paginated aggregation stream.
// Static data today — the aggregation Worker will feed the same FeedItem shape.

const FILTERS: { label: string; types: FeedType[] | null }[] = [
  { label: "All", types: null },
  { label: "Videos", types: ["video"] },
  { label: "Posts", types: ["post", "patreon"] }, // ponytail: Patreon posts read as posts; own chip when volume warrants
  { label: "Releases", types: ["release"] },
  { label: "Social", types: ["social"] },
  { label: "Community", types: ["milestone"] },
];

const INITIAL = 8;
const PAGE = 6;
const CONNECT_EVERY = 6;

export function FeedStream() {
  const [filter, setFilter] = useState("All");
  const [visible, setVisible] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const active = FILTERS.find((f) => f.label === filter)!;
  const matches = (i: FeedItem) => !active.types || active.types.includes(i.type);
  const pinned = FEED.find((i) => i.pinned);
  const stream = FEED.filter((i) => !i.pinned && matches(i));
  const shown = stream.slice(0, visible);

  // Chunks of 6 so the Connect interstitial can break the masonry columns.
  const chunks: FeedItem[][] = [];
  for (let i = 0; i < shown.length; i += CONNECT_EVERY) chunks.push(shown.slice(i, i + CONNECT_EVERY));

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisible((v) => v + PAGE);
      setLoading(false);
    }, 450);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.types ? FEED.filter((i) => f.types!.includes(i.type)).length : FEED.length;
          return (
            <Chip
              key={f.label}
              active={filter === f.label}
              onClick={() => {
                setFilter(f.label);
                setVisible(INITIAL);
              }}
            >
              {f.label} <span className="opacity-50">{count}</span>
            </Chip>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        auto = pulled live from the platform · everything else is posted by the studio
      </p>

      {pinned && (
        <div className="mt-8">
          <FeedCard item={pinned} />
        </div>
      )}

      {stream.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Nothing here yet"
            hint="Follow along on YouTube, Patreon or Instagram — everything we post lands in this feed the moment it goes out."
          />
        </div>
      ) : (
        <>
          {chunks.map((chunk, ci) => (
            <div key={ci}>
              <div className="mt-5 columns-1 gap-5 sm:columns-2">
                {chunk.map((item) => (
                  <div key={item.id} className="mb-5 break-inside-avoid">
                    <FeedCard item={item} />
                  </div>
                ))}
              </div>
              {chunk.length === CONNECT_EVERY && (
                <div className="mt-2">
                  <Connect />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!loading && visible < stream.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={loadMore}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-bh-blue/40 hover:text-bh-cyan"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
