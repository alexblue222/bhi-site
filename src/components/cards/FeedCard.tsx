import { useRef, useState } from "react";
import { Play, X, Lock, ExternalLink, ArrowRight, Eye, Heart, PartyPopper, Pin } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { PlatformBadge } from "../ui/PlatformBadge";
import { MediaTile } from "../ui/MediaTile";
import { getArtist, relTime, PLATFORM_META, type FeedItem } from "../../lib/data";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../../lib/gsapSetup";

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

function PlayGlyph() {
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
      <Play className="ml-0.5 h-5 w-5 text-white" fill="currentColor" aria-hidden />
    </span>
  );
}

function ExpandingPlayer({ item }: { item: FeedItem }) {
  const media = item.media!;
  const frame = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  const embedSrc = `${media.embedUrl}${media.embedUrl!.includes("?") ? "&" : "?"}autoplay=1&rel=0`;

  const toggle = () => {
    const el = frame.current;
    if (!el) return;
    const opening = !open;
    setOpen(opening); // closing unmounts the iframe immediately → playback stops

    if (prefersReducedMotion()) {
      if (thumb.current) gsap.set(thumb.current, { autoAlpha: opening ? 0 : 1 });
      return; // the aspect-class flip resizes the frame instantly
    }
    // Height tween between the 21:9 poster crop and the 16:9 player; the inline
    // height is cleared on complete so the CSS aspect class owns it again (resize-safe).
    // This is a layout tween (not transform/opacity) — it reflows every card below,
    // so any not-yet-revealed ScrollTrigger further down the feed now has a stale
    // start position. Refresh once the reflow settles.
    const target = el.clientWidth * (opening ? 9 / 16 : 9 / 21);
    gsap.fromTo(
      el,
      { height: el.offsetHeight },
      {
        height: target,
        duration: 0.55,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(el, { clearProps: "height" });
          ScrollTrigger.refresh();
        },
      },
    );
    if (thumb.current) gsap.to(thumb.current, { autoAlpha: opening ? 0 : 1, duration: 0.45, ease: "power2.out" });
  };

  return (
    <div
      ref={frame}
      className={`relative overflow-hidden bg-bh-ink ${open ? "aspect-video" : "aspect-[21/9]"}`}
    >
      <div ref={thumb} className="absolute inset-0">
        <ThumbLayers media={media} broken={broken} onBroken={() => setBroken(true)} />
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={`Play — ${item.title}`}
          className="absolute inset-0 flex items-center justify-center"
        >
          <PlayGlyph />
        </button>
      </div>
      {open && (
        <>
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
            onClick={toggle}
            aria-label="Close player"
            className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/85"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}

function VideoCard({ item }: { item: FeedItem }) {
  const media = item.media;
  const expandable = !!media?.embedUrl;
  const [broken, setBroken] = useState(false);

  const content = (
    <div className="p-6 sm:p-7">
      <CardHeader item={item} />
      <h3 className="mt-4 font-display text-xl font-semibold text-slate-100 sm:text-2xl">{item.title}</h3>
      {item.excerpt && <p className="mt-2 leading-relaxed text-slate-400">{item.excerpt}</p>}
      <div className="mt-5 flex items-center justify-between">
        {item.engagement?.views ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Eye className="h-3.5 w-3.5" aria-hidden />{item.engagement.views}
          </span>
        ) : <span />}
        {expandable && item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-bh-cyan"
          >
            Watch on YouTube <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan">
            Watch <ExternalLink className="h-3 w-3" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );

  if (expandable) {
    return (
      <GlassCard>
        <ExpandingPlayer item={item} />
        {content}
      </GlassCard>
    );
  }
  // No embed URL → the whole card links out; media is a static poster.
  return (
    <GlassCard href={item.sourceUrl}>
      {media && (
        <div className="relative aspect-[21/9] overflow-hidden bg-bh-ink">
          <ThumbLayers media={media} broken={broken} onBroken={() => setBroken(true)} />
          <span className="absolute inset-0 flex items-center justify-center"><PlayGlyph /></span>
        </div>
      )}
      {content}
    </GlassCard>
  );
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
