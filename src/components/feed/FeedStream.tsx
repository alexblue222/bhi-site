import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FeedItem, FeedType } from "../../lib/data";
import { FeedCard } from "../cards/FeedCard";
import { Chip } from "../ui/Chip";
import { Connect } from "../ui/Connect";
import { EmptyState } from "../ui/States";
import { fetchLiveFeed } from "../../lib/hub";
import { revealUp, ScrollTrigger } from "../../lib/gsapSetup";

// The centerpiece island: the single centered feed column.
// Static items arrive server-rendered as props (visible immediately — no skeleton);
// on mount the hub Worker is asked for live items, which merge silently into the
// stream (dedupe by sourceUrl||id, pinned stay on top, rest publishedAt desc).

const FILTERS: { label: string; types: FeedType[] | null }[] = [
  { label: "All", types: null },
  { label: "Videos", types: ["video"] },
  { label: "Posts", types: ["post", "patreon"] }, // ponytail: Patreon posts read as posts; own chip when volume warrants
  { label: "Releases", types: ["release"] },
  { label: "Social", types: ["social"] },
  { label: "Community", types: ["milestone"] },
];

const INITIAL = 12;
const PAGE = 8;

/** Scroll-triggered entrance for one card. Fires once; reduced motion handled
 *  inside revealUp. Live items mounting mid-stream get the same subtle entrance. */
function Reveal({ index, children }: { index: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tween = revealUp(ref.current!, { delay: Math.min(index, 5) * 0.06, start: "top 88%" });
    return () => {
      // gsap types don't expose the plugin-added .scrollTrigger on tweens
      (tween as (typeof tween & { scrollTrigger?: ScrollTrigger }) | undefined)?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, []);
  return <div ref={ref}>{children}</div>;
}

/** Thin horizon line between cards — the beacon motif, restrained. */
function Horizon() {
  return (
    <div aria-hidden className="py-7 sm:py-9">
      <div className="mx-auto h-px w-44 bg-gradient-to-r from-transparent via-bh-cyan/20 to-transparent" />
    </div>
  );
}

export function FeedStream({ initial }: { initial: FeedItem[] }) {
  const [live, setLive] = useState<FeedItem[]>([]);
  const [checking, setChecking] = useState(true);
  const [filter, setFilter] = useState("All");
  const [visible, setVisible] = useState(INITIAL);

  useEffect(() => {
    let on = true;
    fetchLiveFeed()
      .then((items) => {
        if (!on) return;
        const seen = new Set(initial.map((i) => i.sourceUrl ?? i.id));
        setLive(items.filter((i) => !seen.has(i.sourceUrl ?? i.id)));
      })
      .finally(() => {
        if (on) setChecking(false); // failure → shimmer just disappears, git content stands
      });
    return () => {
      on = false;
    };
  }, [initial]);

  // Existing card triggers keep pre-insert positions — recalc once live items land.
  useEffect(() => {
    if (live.length) ScrollTrigger.refresh();
  }, [live]);

  const merged = useMemo(() => {
    const all = [...initial, ...live];
    const pinned = all.filter((i) => i.pinned);
    const rest = all.filter((i) => !i.pinned).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return [...pinned, ...rest];
  }, [initial, live]);

  const active = FILTERS.find((f) => f.label === filter)!;
  const stream = active.types ? merged.filter((i) => active.types!.includes(i.type)) : merged;
  const shown = stream.slice(0, visible);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.types ? merged.filter((i) => f.types!.includes(i.type)).length : merged.length;
          return (
            // Zero-item chips stay visible but dimmed/inert — the shape of the feed is stable.
            <span key={f.label} className={count === 0 ? "pointer-events-none opacity-35" : ""}>
              <Chip
                active={filter === f.label}
                onClick={() => {
                  setFilter(f.label);
                  setVisible(INITIAL);
                }}
              >
                {f.label} <span className="opacity-50">{count}</span>
              </Chip>
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        <span aria-hidden className="text-bh-cyan/70">●</span> live — pulled straight from the platform · everything else posted by BHI
      </p>

      {checking && (
        <p className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-bh-cyan/70" />
          <span className="animate-pulse">checking for new drops…</span>
        </p>
      )}

      {shown.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nothing here yet"
            hint="Follow along on YouTube, Patreon or Instagram — everything we post lands in this feed the moment it goes out."
          />
        </div>
      ) : (
        <div className="mt-10">
          {shown.map((item, i) => (
            <div key={item.id}>
              {i > 0 && <Horizon />}
              <Reveal index={i}>
                <FeedCard item={item} />
              </Reveal>
            </div>
          ))}
        </div>
      )}

      {visible < stream.length && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-bh-blue/40 hover:text-bh-cyan"
          >
            Load more
          </button>
        </div>
      )}

      <div className="mt-20">
        <Connect />
      </div>
    </div>
  );
}
