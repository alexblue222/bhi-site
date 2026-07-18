import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, revealUp } from "../../lib/gsapSetup";
import type { Artist, FeedItem } from "../../lib/data";
import { GlassCard } from "../ui/GlassCard";
import { MediaTile } from "../ui/MediaTile";
import { PlatformBadge } from "../ui/PlatformBadge";
import { Connect } from "../ui/Connect";
import { EmptyState } from "../ui/States";

// ─── Home hub tour — the cinematic walk after the hero ────────────────────────
// One island (default export). The hero above owns its own 300vh scroll length
// and emits bhi:hero-progress; these sections simply begin after it. All data
// arrives serialized from index.astro (server → props) — no client fetching.
// Motion: GSAP ScrollTrigger reveals + horizon lines that draw in, once each,
// reduced-motion safe. Sections: Latest · Games · Artists · Connect.
// (Marketplace teaser removed — marketplace is hidden this launch.)

/** getArtists() also carries an optional CMS avatar image on top of Artist. */
export type HomeArtist = Artist & { slug: string; avatarImage?: string };

// Deterministic date (fixed locale + UTC) — identical output at build time and
// in any client timezone, so the static HTML never hydration-mismatches.
const dateFmt = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", timeZone: "UTC" });

// ─── Section scaffold — horizon line + oversized display heading ─────────────

function Section({
  eyebrow,
  title,
  accent = "cyan",
  viewAll,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: "cyan" | "amber";
  viewAll?: { href: string; label: string };
  children: ReactNode;
}) {
  const accentText = accent === "amber" ? "text-bh-amber" : "text-bh-cyan";
  const lineVia = accent === "amber" ? "via-bh-amber/25" : "via-bh-cyan/25";
  return (
    <section data-section className="relative flex min-h-screen flex-col justify-center px-6 py-28 sm:py-36">
      {/* Thin horizon line — draws in (scaleX 0→1) as the section arrives. */}
      <div
        aria-hidden
        data-horizon
        className={`absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-r from-transparent ${lineVia} to-transparent`}
      />
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${accentText}`}>{eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
              {title}
            </h2>
          </div>
          {viewAll && (
            <a
              href={viewAll.href}
              className={`group/all mb-1.5 inline-flex items-center gap-1.5 text-sm font-medium ${accentText} transition-colors hover:text-slate-100`}
            >
              {viewAll.label}
              <span aria-hidden className="transition-transform group-hover/all:translate-x-1">→</span>
            </a>
          )}
        </div>
        <div className="mt-14 sm:mt-16">{children}</div>
      </div>
    </section>
  );
}

// ─── Latest from the hub — editorial teaser rows (not FeedCard) ───────────────

function LatestFromHub({ items }: { items: FeedItem[] }) {
  return (
    <Section eyebrow="Transmissions" title="Latest from the hub" viewAll={{ href: "/feed", label: "Everything" }}>
      {items.length ? (
        <div className="divide-y divide-white/5">
          {items.map((item) => (
            <a
              key={item.id}
              href={item.slug ? `/feed/${item.slug}` : "/feed"}
              data-reveal
              className="group grid items-center gap-x-8 gap-y-4 py-8 first:pt-0 last:pb-0 sm:grid-cols-[11rem_1fr_auto]"
            >
              <MediaTile tint={item.media?.tint ?? "from-[#0a2a6b] to-[#1a9fff]"} aspect="video" className="w-full">
                {/* Real thumb when it exists; a 404 (placeholder video ids) falls back to the tint. */}
                {item.media?.thumbUrl && (
                  <img
                    src={item.media.thumbUrl}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
              </MediaTile>
              <div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <PlatformBadge platform={item.platform} />
                  <span>{item.pinned ? "Pinned" : dateFmt.format(new Date(item.publishedAt))}</span>
                </div>
                <h3 className="mt-2.5 font-display text-xl font-semibold text-slate-100 transition-colors group-hover:text-bh-cyan sm:text-2xl">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400 line-clamp-2">{item.excerpt}</p>
                )}
              </div>
              <span
                aria-hidden
                className="hidden text-lg text-bh-cyan/40 transition-all group-hover:translate-x-1 group-hover:text-bh-cyan sm:block"
              >
                →
              </span>
            </a>
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing in the feed yet" hint="First posts land soon — pick a platform below in the meantime." />
      )}
    </Section>
  );
}

// ─── Games (data + cards shared with /games — keep these exports stable) ─────

// TODO(alex): real titles, pitches and cover art. Set `cover` to a screenshot path in
// public/ and it replaces the gradient automatically (MediaTile falls back on a 404).
export const GAMES = [
  {
    slug: "codename-lyra",
    title: "Codename Lyra",
    status: "In production · Unreal Engine 5",
    pitch: "A first-person multiplayer horror game — survive the dark together, where light is your only edge.",
    longPitch:
      "Codename Lyra is a first-person multiplayer horror game built in Unreal Engine 5. Move through a hostile facility with others, ration your light against the things that hunt in the dark, and try to make it out together. Everything we model, rig and light for it ships to the feed as devlogs while the build comes together.",
    tint: "from-[#0a2a6b] via-[#123fd0] to-[#1a9fff]",
    tags: ["Multiplayer", "Horror", "Unreal Engine 5"],
    cover: "",
  },
];

/** Shared between the home preview and /games — `detail` adds the dev-follow row. */
export function GameCards({ detail = false }: { detail?: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {GAMES.map((g) => (
        <GlassCard key={g.slug} href={detail ? undefined : "/studio"}>
          <MediaTile tint={g.tint} aspect="wide" label={g.title} className="rounded-b-none" />
          <div className="p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-bh-cyan/80">{g.status}</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-100">{g.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{g.pitch}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {g.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-400">
                  {t}
                </span>
              ))}
            </div>
            {detail && (
              <div className="mt-6 border-t border-white/5 pt-5">
                <a href="/feed" className="py-2 text-sm font-medium text-bh-cyan transition-colors hover:text-slate-100">
                  Follow development in the feed →
                </a>
              </div>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function FeaturedGames() {
  return (
    <Section eyebrow="Interactive" title="Featured games" viewAll={{ href: "/studio", label: "The studio" }}>
      <div data-reveal>
        <GameCards />
      </div>
    </Section>
  );
}

// ─── Artists — amber mini cards (human territory) ─────────────────────────────

function ArtistsPreview({ artists }: { artists: HomeArtist[] }) {
  return (
    <Section eyebrow="The people" title="Meet the creators" accent="amber" viewAll={{ href: "/creators", label: "Full roster" }}>
      {artists.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map((a) => (
            <a
              key={a.slug}
              href={`/creators/${a.slug}`}
              data-reveal
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-bh-amber/40 hover:shadow-[0_0_32px_-12px_rgba(255,179,71,0.35)]"
            >
              <div
                className={`relative grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-gradient-to-br ${a.avatarTint} ring-1 ring-white/15`}
              >
                {a.avatarImage ? (
                  <img src={a.avatarImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-lg font-semibold text-white/90">{a.initials}</span>
                )}
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-slate-100">{a.name}</h3>
              <p className="mt-0.5 text-[13px] font-medium text-bh-amber/90">{a.role}</p>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-400 line-clamp-2">{a.bio}</p>
            </a>
          ))}
        </div>
      ) : (
        <EmptyState title="The roster is forming" />
      )}
    </Section>
  );
}

// ─── Connect — full-bleed closing beat with the horizon glow ──────────────────

function ConnectSection() {
  return (
    <section data-section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-40 pt-28 sm:pb-48 sm:pt-36">
      <div
        aria-hidden
        data-horizon
        className="absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-r from-transparent via-bh-cyan/25 to-transparent"
      />
      {/* Horizon glow rising from the page's bottom edge — the beacon signing off. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80"
        style={{
          background:
            "radial-gradient(70% 100% at 50% 100%, rgba(88,214,255,0.13), rgba(46,155,255,0.05) 45%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-bh-cyan/50 to-transparent"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p data-reveal className="text-xs font-semibold uppercase tracking-[0.3em] text-bh-cyan">
          Connect
        </p>
        <h2
          data-reveal
          className="mt-4 text-balance font-display text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl"
        >
          The future is not given to us. <span className="text-bh-cyan">It is built.</span>
        </h2>
        <p data-reveal className="mx-auto mt-5 max-w-md text-slate-400">
          One signal, every platform — everything we make lands here first.
        </p>
        {/* TODO(alex): newsletter provider — Connect's updates CTA routes to /contact until it exists. */}
        <div data-reveal className="mt-10 flex justify-center">
          <Connect compact />
        </div>
      </div>
    </section>
  );
}

// ─── Island root — wires the ScrollTrigger choreography once ──────────────────

export default function HubSections({ feed, artists }: { feed: FeedItem[]; artists: HomeArtist[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduced = prefersReducedMotion();
      root.querySelectorAll<HTMLElement>("[data-section]").forEach((sec) => {
        const line = sec.querySelector<HTMLElement>("[data-horizon]");
        if (line) {
          if (reduced) gsap.set(line, { scaleX: 1 });
          else
            gsap.fromTo(
              line,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 1.4,
                ease: "power2.inOut",
                scrollTrigger: { trigger: sec, start: "top 88%", once: true },
              },
            );
        }
        revealUp(sec.querySelectorAll("[data-reveal]"), { start: "top 82%" });
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef}>
      <LatestFromHub items={feed} />
      <FeaturedGames />
      <ArtistsPreview artists={artists} />
      <ConnectSection />
    </div>
  );
}
