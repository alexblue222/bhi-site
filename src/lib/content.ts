// ─── Content adapter — collections → the shapes every surface renders ─────────
// Server-side only (astro:content). Pages/components import from here, never
// from the collections directly, so the FeedItem/Artist contracts stay stable.
import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { Artist, FeedItem } from "./data";

const DEFAULT_TINT = "from-[#0a2a6b] to-[#1a9fff]";

/** glob-loader ids are already extensionless; strip defensively. */
const slugOf = (id: string) => id.replace(/\.(md|ya?ml)$/, "");

const paragraphs = (body?: string) =>
  (body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

// ─── Artists ──────────────────────────────────────────────────────────────────

export async function getArtists(): Promise<(Artist & { slug: string })[]> {
  const entries = await getCollection("artists");
  return entries
    .map((entry) => ({
      slug: slugOf(entry.id),
      name: entry.data.name,
      role: entry.data.role,
      initials: entry.data.initials,
      avatarTint: entry.data.avatarTint,
      avatarImage: entry.data.avatarImage,
      bio: entry.data.bio,
      longBio: paragraphs(entry.body),
      socials: entry.data.socials as Artist["socials"],
      portfolio: entry.data.portfolio,
      featured: entry.data.featured,
      order: entry.data.order,
    }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function getArtist(slug: string): Promise<(Artist & { slug: string }) | undefined> {
  return (await getArtists()).find((a) => a.slug === slug);
}

// ─── Blog → FeedItem ──────────────────────────────────────────────────────────

export async function getBlogFeedItems(): Promise<FeedItem[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts
    .map((entry): FeedItem => {
      const slug = slugOf(entry.id);
      return {
        id: `post-${slug}`,
        type: "post",
        platform: "bhi",
        title: entry.data.title,
        excerpt: entry.data.description,
        slug,
        media: {
          tint: entry.data.heroTint ?? DEFAULT_TINT,
          aspect: "wide",
          thumbUrl: entry.data.heroImage,
        },
        author: entry.data.author,
        publishedAt: entry.data.publishedAt.toISOString(),
        tags: entry.data.tags,
        source: "manual",
      };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Raw collection entry for render() on /feed/[slug]. */
export async function getBlogEntry(slug: string): Promise<CollectionEntry<"blog"> | undefined> {
  return getEntry("blog", slug);
}

// ─── Pins → FeedItem ──────────────────────────────────────────────────────────

function youtubeId(u: URL): string | undefined {
  if (u.hostname.replace(/^www\./, "") === "youtu.be") return u.pathname.slice(1).split("/")[0] || undefined;
  return u.searchParams.get("v") ?? u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
}

export async function getPinFeedItems(): Promise<FeedItem[]> {
  const pins = await getCollection("pins");
  return pins
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry): FeedItem => {
      const url = new URL(entry.data.url);
      const host = url.hostname.replace(/^www\./, "");

      let platform: FeedItem["platform"] = "bhi";
      let type: FeedItem["type"] = "social";
      let media: FeedItem["media"];

      if (host === "youtu.be" || host.endsWith("youtube.com")) {
        platform = "youtube";
        type = "video";
        const id = youtubeId(url);
        if (id) {
          media = {
            tint: DEFAULT_TINT,
            aspect: "video",
            thumbUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
          };
        }
      } else if (host.includes("instagram")) {
        platform = "instagram";
      } else if (host.includes("patreon")) {
        platform = "patreon";
        type = "patreon";
      }

      return {
        id: `pin-${slugOf(entry.id)}`,
        type,
        platform,
        title: entry.data.title,
        excerpt: entry.data.note,
        media,
        sourceUrl: entry.data.url,
        // Pins have no real date. A build-time `new Date()` here would bake a fresh
        // timestamp into every build (non-deterministic + fake "1m ago" freshness) —
        // constant sentinel instead; the card shows the Pinned label, never this date.
        publishedAt: "2026-01-01T00:00:00.000Z",
        pinned: true,
        source: "manual",
      };
    });
}

// ─── Merged static feed (the git half; Worker items merge client-side) ────────

export async function getStaticFeed(): Promise<FeedItem[]> {
  const [pins, blog] = await Promise.all([getPinFeedItems(), getBlogFeedItems()]);
  return [...pins, ...blog]; // each already sorted within its group
}
