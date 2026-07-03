import { GlassCard } from "../ui/GlassCard";
import { PlatformIcon } from "../ui/PlatformBadge";
import type { Artist, PortfolioPiece } from "../../lib/data";

// Artist roster card — the human element of the hub, so this is amber territory.
// Renders the collection-backed shape from src/lib/content.ts (data.ts Artist +
// slug + optional CMS images on avatar/portfolio).

export type RosterArtist = Artist & {
  slug: string;
  avatarImage?: string;
  portfolio: (PortfolioPiece & { image?: string })[];
};

/** Avatar: uploaded image when the CMS has one, initials on the tint gradient otherwise. */
export function Avatar({ artist, size = "h-14 w-14 text-lg" }: { artist: RosterArtist; size?: string }) {
  return artist.avatarImage ? (
    <img
      src={artist.avatarImage}
      alt={artist.name}
      className={`shrink-0 rounded-2xl border border-white/10 object-cover ${size}`}
    />
  ) : (
    <span
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${artist.avatarTint} font-display font-semibold text-white ${size}`}
      aria-hidden
    >
      {artist.initials}
    </span>
  );
}

/** Portfolio peek tile — image when present, tint gradient + sheen otherwise. */
function Thumb({ piece, className = "aspect-square" }: { piece: RosterArtist["portfolio"][number]; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${piece.tint} ${className}`} title={piece.label}>
      {piece.image ? (
        <img src={piece.image} alt={piece.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div
          className="h-full w-full opacity-40 mix-blend-screen"
          style={{ background: "radial-gradient(120% 90% at 25% 0%, rgba(255,255,255,0.35), transparent 60%)" }}
        />
      )}
    </div>
  );
}

function SocialIcons({ artist }: { artist: RosterArtist }) {
  // Display-only (the whole card is a link — no nested anchors).
  return (
    <>
      {artist.socials.map((s) => (
        <span
          key={s.platform}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]"
        >
          <PlatformIcon platform={s.platform} className="h-3.5 w-3.5" />
        </span>
      ))}
    </>
  );
}

export function ArtistCard({ artist, hero = false }: { artist: RosterArtist; hero?: boolean }) {
  if (hero) {
    // Featured artist — the monumental card at the top of the roster.
    return (
      <GlassCard href={`/artists/${artist.slug}`} glow="amber" className="p-6 sm:p-10">
        {/* amber horizon-line — the human-surface counterpart of the beacon hairline */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bh-amber/60 to-transparent"
          aria-hidden
        />
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-5">
              <Avatar artist={artist} size="h-20 w-20 text-2xl" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-bh-amber">{artist.role}</p>
                <h3 className="mt-1.5 font-display text-3xl font-semibold text-slate-100 sm:text-4xl">{artist.name}</h3>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">{artist.bio}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-slate-500">
              <SocialIcons artist={artist} />
              <span className="ml-2 text-sm font-medium text-bh-amber/80 transition-transform duration-300 group-hover:translate-x-0.5">
                View portfolio →
              </span>
            </div>
          </div>
          <div className="grid w-full shrink-0 grid-cols-3 gap-2.5 md:w-[340px]">
            {artist.portfolio.slice(0, 3).map((p) => (
              <Thumb key={p.label} piece={p} className="aspect-[4/5]" />
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard href={`/artists/${artist.slug}`} glow="amber" className="p-6">
      <div className="flex items-center gap-4">
        <Avatar artist={artist} />
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-100">{artist.name}</h3>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-bh-amber/90">{artist.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">{artist.bio}</p>
      {/* portfolio peek */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {artist.portfolio.slice(0, 3).map((p) => (
          <Thumb key={p.label} piece={p} />
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 text-slate-500">
        <SocialIcons artist={artist} />
        <span className="ml-auto text-xs font-medium text-bh-amber/80 transition-transform duration-300 group-hover:translate-x-0.5">
          View portfolio →
        </span>
      </div>
    </GlassCard>
  );
}
