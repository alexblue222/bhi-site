import { Play, Lock, ExternalLink, ArrowRight, Eye, Heart, PartyPopper, Pin } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { PlatformBadge } from "../ui/PlatformBadge";
import { MediaTile } from "../ui/MediaTile";
import { getArtist, relTime, type FeedItem } from "../../lib/data";

// The centerpiece of the hub: ONE card family, six variants — video / post / patreon /
// release / social / milestone. Origin is always legible (platform badge + auto/manual
// marker); milestones are the amber "human element" moments.

function CardHeader({ item }: { item: FeedItem }) {
  return (
    <div className="flex items-center gap-2.5">
      <PlatformBadge platform={item.platform} />
      <span className="text-xs text-slate-500">{relTime(item.publishedAt)}</span>
      {item.source === "auto" && (
        <span className="rounded-full border border-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-600" title="Pulled automatically from the platform">
          auto
        </span>
      )}
      {item.pinned && <Pin className="ml-auto h-3.5 w-3.5 text-bh-cyan/70" aria-label="Pinned" />}
    </div>
  );
}

function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-400">{t}</span>
      ))}
    </div>
  );
}

function Author({ slug }: { slug?: string }) {
  const artist = getArtist(slug);
  if (!artist) return null;
  return (
    <a href={`/artists/${artist.slug}`} className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500 transition-colors hover:text-bh-cyan">
      <span className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${artist.avatarTint} text-[9px] font-semibold text-white`}>
        {artist.initials}
      </span>
      {artist.name}
    </a>
  );
}

export function FeedCard({ item }: { item: FeedItem }) {
  switch (item.type) {
    case "video":
      return (
        <GlassCard href={item.sourceUrl} className="p-5">
          <CardHeader item={item} />
          {item.media && (
            <MediaTile tint={item.media.tint} aspect="video" className="mt-4">
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <Play className="ml-0.5 h-5 w-5 text-white" fill="currentColor" aria-hidden />
                </span>
              </span>
              {item.media.duration && (
                <span className="absolute bottom-2.5 right-2.5 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {item.media.duration}
                </span>
              )}
            </MediaTile>
          )}
          <h3 className="mt-4 font-semibold text-slate-100">{item.title}</h3>
          {item.excerpt && <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.excerpt}</p>}
          <div className="mt-4 flex items-center justify-between">
            {item.engagement?.views && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Eye className="h-3.5 w-3.5" aria-hidden />{item.engagement.views}</span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan">Watch <ExternalLink className="h-3 w-3" aria-hidden /></span>
          </div>
        </GlassCard>
      );

    case "post":
      return (
        <GlassCard href={item.slug ? `/feed/${item.slug}` : undefined} className="p-5">
          <CardHeader item={item} />
          {item.media && <MediaTile tint={item.media.tint} label={item.media.label} aspect={item.media.aspect ?? "wide"} className="mt-4" />}
          <h3 className="mt-4 text-lg font-semibold text-slate-100">{item.title}</h3>
          {item.excerpt && <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.excerpt}</p>}
          <Tags tags={item.tags} />
          <div className="mt-4 flex items-center justify-between">
            <Author slug={item.author} />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan">Read <ArrowRight className="h-3 w-3" aria-hidden /></span>
          </div>
        </GlassCard>
      );

    case "patreon":
      return (
        <GlassCard href={item.sourceUrl} className="p-5">
          <CardHeader item={item} />
          <h3 className="mt-4 font-semibold text-slate-100">{item.title}</h3>
          {item.memberOnly ? (
            <div className="relative mt-1.5">
              <p className="select-none text-sm leading-relaxed text-slate-400 blur-[6px]">{item.excerpt}</p>
              <span className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-medium text-[#ff9d8d]">
                <Lock className="h-3.5 w-3.5" aria-hidden /> Members only
              </span>
            </div>
          ) : (
            item.excerpt && <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.excerpt}</p>
          )}
          <Tags tags={item.tags} />
          <div className="mt-4 text-right">
            <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "#ff7864" }}>
              {item.memberOnly ? "Unlock on Patreon" : "Read on Patreon"} <ExternalLink className="h-3 w-3" aria-hidden />
            </span>
          </div>
        </GlassCard>
      );

    case "release":
      return (
        <GlassCard href={item.sourceUrl} className="p-5">
          <CardHeader item={item} />
          <div className="mt-4 flex gap-4">
            {item.media && (
              <MediaTile tint={item.media.tint} aspect="square" className="h-24 w-24 shrink-0">
                <span className="absolute left-1.5 top-1.5 rounded bg-bh-cyan/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">New</span>
              </MediaTile>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-100">{item.title}</h3>
              {item.excerpt && <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.excerpt}</p>}
              <div className="mt-2.5 flex items-center gap-3">
                {item.tags?.[0] && <span className="text-sm font-semibold text-bh-cyan">{item.tags[0]}</span>}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan/80">View <ArrowRight className="h-3 w-3" aria-hidden /></span>
              </div>
            </div>
          </div>
        </GlassCard>
      );

    case "social":
      return (
        <GlassCard href={item.sourceUrl} className="p-5">
          <CardHeader item={item} />
          {item.media && <MediaTile tint={item.media.tint} label={item.media.label} aspect="square" className="mt-4" />}
          <p className="mt-3.5 text-sm leading-relaxed text-slate-300">{item.title}</p>
          {item.excerpt && <p className="mt-1 text-sm text-slate-500">{item.excerpt}</p>}
          <div className="mt-3.5 flex items-center justify-between">
            {item.engagement?.likes && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Heart className="h-3.5 w-3.5" aria-hidden />{item.engagement.likes}</span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-bh-cyan">View <ExternalLink className="h-3 w-3" aria-hidden /></span>
          </div>
        </GlassCard>
      );

    case "milestone":
      return (
        <GlassCard glow="amber" className="border-bh-amber/20 p-5">
          <CardHeader item={item} />
          <div className="mt-4 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-bh-amber/30 bg-bh-amber/10">
              <PartyPopper className="h-5 w-5 text-bh-amber" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl font-semibold text-bh-amber">{item.title}</h3>
              {item.excerpt && <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.excerpt}</p>}
              {item.milestone?.progress !== undefined && item.milestone.progress < 1 && (
                <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
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
