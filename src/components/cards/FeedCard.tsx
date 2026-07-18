import { useState } from "react";
import { Play, X, Lock, ExternalLink, ArrowRight, Eye, Heart, PartyPopper, Pin } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { PlatformBadge } from "../ui/PlatformBadge";
import { MediaTile } from "../ui/MediaTile";
import { getArtist, relTime, PLATFORM_META, type FeedItem } from "../../lib/data";

// The centerpiece card family — ONE glass card, six variants (video / post / patreon /
// release / social / milestone), sized for the single centered feed column. Video cards
// expand in place to an inline player (lazy iframe — never loaded before click).
// Origin is always legible: platform badge + the live/posted-by-BHI source marker.
// Client-island only (video expansion uses hooks + GSAP).

function SourceMarker({ source }: { source: FeedItem["source"] }) {
  const live = source === "auto";
  return (
    <span
      className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-500"
      title={live ? "Pulled automatically from the platform" : "Posted by the studio"}
    >
      <span
        aria-hidden
        className={`h-1 w-1 rounded-full ${live ? "bg-bh-cyan shadow-[0_0_6px_rgba(88,214,255,0.9)]" : "bg-slate-500"}`}
      />
      {live ? "live" : "posted by BHI"}
    </span>
  );
}

function CardHeader({ item }: { item: FeedItem }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <PlatformBadge platform={item.platform} />
      {/* Pins carry no real date (constant sentinel) — show only the Pinned label.
          relTime is wall-clock-relative: build-time SSR text always drifts from
          hydration-time text. Suppress the mismatch — the client value is fresher. */}
      {!item.pinned && (
        <span className="text-xs text-slate-500" suppressHydrationWarning>{relTime(item.publishedAt)}</span>
      )}
      {item.pinned && (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-bh-cyan/80">
          <Pin className="h-3 w-3" aria-hidden /> Pinned
        </span>
      )}
      <SourceMarker source={item.source} />
    </div>
  );
}

function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-400">{t}</span>
      ))}
    </div>
  );
}

function Author({ slug }: { slug?: string }) {
  const artist = getArtist(slug);
  if (!artist) return null;
  // NOT a link: this renders inside GlassCard's href (an <a>) — nested anchors are
  // invalid HTML, the parser splits them and React hydration fails (#418). The artist
  // is clickable from the post detail page instead.
  return (
    <span className="inline-flex items-center gap-2 text-xs text-slate-500">
      <span className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${artist.avatarTint} text-[9px] font-semibold text-white`}>
        {artist.initials}
      </span>
      {artist.name}
    </span>
  );
}

// ─── Video media: cinematic 21:9 poster → expands in place to a 16:9 player ────

/** Thumbnail layers: tint gradient always behind, real thumb over it when it loads.
 *  Placeholder video IDs 404 their thumbnails — the tint carries the card. */
function ThumbLayers({ media, broken, onBroken }: {
  media: NonNullable<FeedItem["media"]>;
  broken: boolean;
  onBroken: () => void;
}) {
  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${media.tint}`} />
      <div
        className="absolute inset-0 opacity-35 mix-blend-screen"
        style={{ background: "radial-gradient(130% 90% at 20% 0%, rgba(255,255,255,0.4), transparent 55%)" }}
      />
      {media.thumbUrl && !broken && (
        <img
          src={media.thumbUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={onBroken}
        />
      )}
      {media.duration && (
        <span className="absolute bottom-2.5 right-2.5 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {media.duration}
        </span>
      )}
    </>
  );
}

function PlayGlyph({ sm = false }: { sm?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${sm ? "h-11 w-11" : "h-14 w-14"}`}
    >
      <Play className={`ml-0.5 text-white ${sm ? "h-4 w-4" : "h-5 w-5"}`} fill="currentColor" aria-hidden />
    </span>
  );
}

// ─── Video: horizontal card — thumbnail LEFT, title + description RIGHT ────────
// Resting = thumb-left row. Clicking the thumbnail swaps the card to a full-width
// inline 16:9 player (lazy iframe — never loaded before click), with the title +
// description below it. Non-embeddable items (no embedUrl) link straight out.

/** The left thumbnail: fixed-width 16:9 poster with the play glyph. A <button> when
 *  it plays inline, a plain <div> when the whole card is already a link. */
function VideoThumb({ item, broken, onBroken, onPlay }: {
  item: FeedItem;
  broken: boolean;
  onBroken: () => void;
  onPlay?: () => void;
}) {
  const cls = "relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-bh-ink sm:w-52 md:w-60";
  const inner = (
    <>
      <ThumbLayers media={item.media!} broken={broken} onBroken={onBroken} />
      <span className="absolute inset-0 flex items-center justify-center"><PlayGlyph sm /></span>
    </>
  );
  return onPlay ? (
    <button type="button" onClick={onPlay} aria-label={`Play — ${item.title}`} className={cls}>{inner}</button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function VideoCard({ item }: { item: FeedItem }) {
  const media = item.media;
  const expandable = !!media?.embedUrl;
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  // Watch affordance: a real out-link when the card itself is NOT a link (embeddable
  // → GlassCard is a <div>), a plain label when the whole card already links out
  // (avoids an illegal nested <a>).
  const watch = expandable ? (
    item.sourceUrl ? (
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-bh-cyan"
      >
        Watch on YouTube <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
    ) : <span />
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan">
      Watch <ExternalLink className="h-3 w-3" aria-hidden />
    </span>
  );

  // The right-hand text column — title over description, shared by both layouts.
  const text = (
    <div className="min-w-0 flex-1">
      <CardHeader item={item} />
      <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold leading-snug text-slate-100 sm:text-xl">{item.title}</h3>
      {item.excerpt && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400 sm:line-clamp-3">{item.excerpt}</p>}
      <div className="mt-4 flex items-center justify-between">
        {item.engagement?.views ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Eye className="h-3.5 w-3.5" aria-hidden />{item.engagement.views}
          </span>
        ) : <span />}
        {watch}
      </div>
    </div>
  );

  // Expanded: full-width inline player, text below. (ponytail: instant swap, no height
  // tween — one fewer moving part; the reveal-on-scroll entrance still applies once.)
  if (expandable && open) {
    const embedSrc = `${media!.embedUrl}${media!.embedUrl!.includes("?") ? "&" : "?"}autoplay=1&rel=0`;
    return (
      <GlassCard>
        <div className="relative aspect-video overflow-hidden bg-bh-ink">
          <iframe
            src={embedSrc}
            title={item.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close player"
            className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/85"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="p-5 sm:p-6">{text}</div>
      </GlassCard>
    );
  }

  // Resting: horizontal row — thumbnail left, text right.
  const row = (
    <div className="flex items-start gap-4 p-3 sm:gap-5 sm:p-4">
      <VideoThumb
        item={item}
        broken={broken}
        onBroken={() => setBroken(true)}
        onPlay={expandable ? () => setOpen(true) : undefined}
      />
      {text}
    </div>
  );

  // Embeddable → container div (the thumb button plays). Otherwise the whole card links out.
  return expandable ? <GlassCard>{row}</GlassCard> : <GlassCard href={item.sourceUrl}>{row}</GlassCard>;
}

// ─── The card family ───────────────────────────────────────────────────────────

export function FeedCard({ item }: { item: FeedItem }) {
  switch (item.type) {
    case "video":
      return <VideoCard item={item} />;

    case "post":
      return (
        <GlassCard href={item.slug ? `/feed/${item.slug}` : item.sourceUrl} className="p-6 sm:p-7">
          <CardHeader item={item} />
          {item.media && (
            item.media.thumbUrl ? (
              <div className="relative mt-5 overflow-hidden rounded-xl bg-bh-ink">
                <img src={item.media.thumbUrl} alt="" loading="lazy" className="aspect-[21/9] w-full object-cover" />
              </div>
            ) : (
              <MediaTile tint={item.media.tint} label={item.media.label} aspect={item.media.aspect ?? "wide"} className="mt-5" />
            )
          )}
          <h3 className="mt-5 font-display text-xl font-semibold text-slate-100 sm:text-2xl">{item.title}</h3>
          {item.excerpt && <p className="mt-2 leading-relaxed text-slate-400">{item.excerpt}</p>}
          <Tags tags={item.tags} />
          <div className="mt-5 flex items-center justify-between">
            <Author slug={item.author} />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan">Read <ArrowRight className="h-3 w-3" aria-hidden /></span>
          </div>
        </GlassCard>
      );

    case "patreon":
      return (
        <GlassCard href={item.sourceUrl} className="p-6 sm:p-7">
          <CardHeader item={item} />
          <h3 className="mt-4 font-display text-xl font-semibold text-slate-100">{item.title}</h3>
          {item.memberOnly ? (
            <div className="relative mt-2">
              <p className="select-none leading-relaxed text-slate-400 blur-[6px]">{item.excerpt}</p>
              <span className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-medium" style={{ color: PLATFORM_META.patreon.color }}>
                <Lock className="h-3.5 w-3.5" aria-hidden /> Members only
              </span>
            </div>
          ) : (
            item.excerpt && <p className="mt-2 leading-relaxed text-slate-400">{item.excerpt}</p>
          )}
          <Tags tags={item.tags} />
          <div className="mt-5 text-right">
            <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: PLATFORM_META.patreon.color }}>
              {item.memberOnly ? "Unlock on Patreon" : "Read on Patreon"} <ExternalLink className="h-3 w-3" aria-hidden />
            </span>
          </div>
        </GlassCard>
      );

    case "release":
      return (
        <GlassCard href={item.sourceUrl} className="p-6 sm:p-7">
          <CardHeader item={item} />
          <div className="mt-5 flex gap-5">
            {item.media && (
              <MediaTile tint={item.media.tint} aspect="square" className="h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                <span className="absolute left-1.5 top-1.5 rounded bg-bh-cyan/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">New</span>
              </MediaTile>
            )}
            <div className="min-w-0">
              <h3 className="font-display text-xl font-semibold text-slate-100">{item.title}</h3>
              {item.excerpt && <p className="mt-1.5 leading-relaxed text-slate-400">{item.excerpt}</p>}
              <div className="mt-3 flex items-center gap-3">
                {item.tags?.[0] && <span className="text-sm font-semibold text-bh-cyan">{item.tags[0]}</span>}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan/80">View <ArrowRight className="h-3 w-3" aria-hidden /></span>
              </div>
            </div>
          </div>
        </GlassCard>
      );

    case "social":
      return (
        <GlassCard href={item.sourceUrl} className="p-6 sm:p-7">
          <CardHeader item={item} />
          {item.media && <MediaTile tint={item.media.tint} label={item.media.label} aspect="square" className="mt-5 max-w-sm" />}
          <p className="mt-4 leading-relaxed text-slate-200">{item.title}</p>
          {item.excerpt && <p className="mt-1 text-sm text-slate-500">{item.excerpt}</p>}
          <div className="mt-4 flex items-center justify-between">
            {item.engagement?.likes ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Heart className="h-3.5 w-3.5" aria-hidden />{item.engagement.likes}</span>
            ) : <span />}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan">View <ExternalLink className="h-3 w-3" aria-hidden /></span>
          </div>
        </GlassCard>
      );

    case "milestone":
      return (
        <GlassCard glow="amber" className="border-bh-amber/20 p-6 sm:p-7">
          <CardHeader item={item} />
          <div className="mt-5 flex items-start gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-bh-amber/30 bg-bh-amber/10">
              <PartyPopper className="h-5 w-5 text-bh-amber" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-2xl font-semibold text-bh-amber sm:text-3xl">{item.title}</h3>
              {item.excerpt && <p className="mt-2 leading-relaxed text-slate-400">{item.excerpt}</p>}
              {item.milestone?.progress !== undefined && item.milestone.progress < 1 && (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-bh-amber/60 to-bh-amber"
                    style={{ width: `${Math.round(item.milestone.progress * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      );
  }
}
