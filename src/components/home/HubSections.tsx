import type { ReactNode } from "react";
import { SectionHead } from "../ui/SectionHead";
import { GlassCard } from "../ui/GlassCard";
import { MediaTile } from "../ui/MediaTile";
import { Connect } from "../ui/Connect";
import { EmptyState } from "../ui/States";
import { FeedCard } from "../cards/FeedCard";
import { ProductCard } from "../cards/ProductCard";
import { ArtistCard } from "../cards/ArtistCard";
import { ARTISTS, FEED, PRODUCTS } from "../../lib/data";

// Home hub tour — fully static sections (SSR, no hydration). Each section is a
// preview of one IA surface with a "view all" escape hatch.

function Section({
  head,
  viewAll,
  children,
}: {
  head: ReactNode;
  viewAll?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {head}
          {viewAll && (
            <a href={viewAll.href} className="text-sm text-bh-cyan transition-colors hover:text-slate-100">
              {viewAll.label}
            </a>
          )}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

// ─── Latest ───────────────────────────────────────────────────────────────────

export function LatestFromHub() {
  const latest = FEED.filter((f) => !f.pinned)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);
  return (
    <Section
      head={<SectionHead align="left" eyebrow="Latest" title="From the hub" />}
      viewAll={{ href: "/feed", label: "Everything →" }}
    >
      {latest.length ? (
        <div className="grid gap-5 sm:grid-cols-3">
          {latest.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing in the feed yet" hint="First posts land soon — pick a platform below in the meantime." />
      )}
    </Section>
  );
}

// ─── Games ────────────────────────────────────────────────────────────────────

export const GAMES = [
  {
    slug: "project-aurora",
    title: "Project Aurora",
    status: "In production · Unreal Engine",
    pitch: "A lone beacon lights the dark — cross a sleeping world and wake it one signal at a time.",
    tint: "from-[#0a2a6b] via-[#123fd0] to-[#1a9fff]",
    tags: ["Real-time", "Unreal"],
  },
  {
    slug: "untitled-rpg",
    title: "Untitled RPG",
    status: "Prototype · Systems-first",
    pitch: "Mechanics before story, simulation before script — an RPG grown from its systems outward.",
    tint: "from-[#0a1f5c] to-[#2e6bff]",
    tags: ["Systems", "Design"],
  },
];

/** Shared between the home preview and /games — `detail` adds the dev-follow row. */
export function GameCards({ detail = false }: { detail?: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {GAMES.map((g) => (
        <GlassCard key={g.slug} href={detail ? undefined : "/games"}>
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
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-5">
                <a href="/feed" className="py-2 text-sm font-medium text-bh-cyan transition-colors hover:text-slate-100">
                  Follow development in the feed →
                </a>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-500"
                >
                  Wishlist — soon
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

export function FeaturedGames() {
  return (
    <Section
      head={<SectionHead align="left" eyebrow="Interactive" title="The games" />}
      viewAll={{ href: "/games", label: "View all →" }}
    >
      <GameCards />
    </Section>
  );
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

export function MarketplacePreview() {
  const products = PRODUCTS.filter((p) => p.status === "available").slice(0, 3);
  return (
    <Section
      head={<SectionHead align="left" eyebrow="Marketplace" title="Made in production, sold direct" />}
      viewAll={{ href: "/marketplace", label: "View all →" }}
    >
      {products.length ? (
        <div className="grid gap-5 sm:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState title="The shelves are being stocked" hint="First tools and assets land here soon." />
      )}
    </Section>
  );
}

// ─── Artists (amber — human territory) ───────────────────────────────────────

export function ArtistsPreview() {
  return (
    <Section
      head={<SectionHead align="left" accent="amber" eyebrow="The people" title="Meet the artists" />}
      viewAll={{ href: "/artists", label: "View all →" }}
    >
      {ARTISTS.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ARTISTS.map((a) => (
            <ArtistCard key={a.slug} artist={a} />
          ))}
        </div>
      ) : (
        <EmptyState title="The roster is forming" />
      )}
    </Section>
  );
}

// ─── Outro ───────────────────────────────────────────────────────────────────

export function HomeOutro() {
  return (
    <section className="border-t border-white/5 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-center font-display text-2xl text-slate-200">
          The future is not given to us. It is built.
        </p>
        <div className="mt-12">
          <Connect />
        </div>
      </div>
    </section>
  );
}
