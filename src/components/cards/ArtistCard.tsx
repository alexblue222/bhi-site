import { GlassCard } from "../ui/GlassCard";
import { PlatformIcon } from "../ui/PlatformBadge";
import type { Artist } from "../../lib/data";

// Artist roster card — the human element of the hub, so this is amber territory.
export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <GlassCard href={`/artists/${artist.slug}`} glow="amber" className="p-6">
      <div className="flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${artist.avatarTint} font-display text-lg font-semibold text-white`}>
          {artist.initials}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-100">{artist.name}</h3>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-bh-amber/90">{artist.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">{artist.bio}</p>
      {/* portfolio peek */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {artist.portfolio.slice(0, 3).map((p) => (
          <div key={p.label} className={`aspect-square overflow-hidden rounded-lg bg-gradient-to-br ${p.tint}`} title={p.label}>
            <div className="h-full w-full opacity-40 mix-blend-screen" style={{ background: "radial-gradient(120% 90% at 25% 0%, rgba(255,255,255,0.35), transparent 60%)" }} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 text-slate-500">
        {artist.socials.map((s) => (
          <span key={s.platform} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
            <PlatformIcon platform={s.platform} className="h-3.5 w-3.5" />
          </span>
        ))}
        <span className="ml-auto text-xs font-medium text-bh-amber/80 transition-transform duration-300 group-hover:translate-x-0.5">View portfolio →</span>
      </div>
    </GlassCard>
  );
}
