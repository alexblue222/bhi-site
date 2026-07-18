// ─── Blue Horizon hub — content models + placeholder data ────────────────────
// The design source of truth. Every card on the site renders from these shapes;
// the future aggregation Worker + Lemon Squeezy wiring must produce the same fields.
// All entries below are PLACEHOLDER content for Alex to replace with real data.

export type Platform =
  | "youtube" | "patreon" | "instagram" | "tiktok"
  | "gumroad" | "superhive" | "fab" | "kickstarter"
  | "discord" | "bhi";

export type FeedType = "video" | "post" | "patreon" | "release" | "social" | "milestone";

export interface FeedItem {
  id: string;
  type: FeedType;
  platform: Platform;
  title: string;
  excerpt?: string;
  /** First-party posts only — paragraphs rendered on /feed/[slug]. */
  body?: string[];
  /** First-party posts only — detail route. */
  slug?: string;
  media?: { tint: string; label?: string; aspect?: "video" | "square" | "wide"; duration?: string; thumbUrl?: string; embedUrl?: string };
  sourceUrl?: string;
  /** Artist slug. */
  author?: string;
  publishedAt: string; // ISO
  tags?: string[];
  pinned?: boolean;
  memberOnly?: boolean;
  /** auto = pulled from the platform API · manual = posted/curated by BHI. */
  source: "auto" | "manual";
  engagement?: { views?: string; likes?: string };
  milestone?: { value: string; progress?: number };
}

export interface PortfolioPiece {
  label: string;
  tint: string;
  medium: "Game art" | "Cinematics" | "Plugins" | "Illustration";
  span?: string; // tailwind col/row span for the masonry grid
}

export interface Artist {
  slug: string;
  name: string;
  role: string;
  initials: string;
  avatarTint: string;
  bio: string;
  longBio?: string[];
  socials: { platform: Platform | "web"; href: string }[];
  portfolio: PortfolioPiece[];
  featured?: boolean;
}

export interface LicenseTier { name: string; price: number; note?: string }

// Alex's real catalogue: plugins (his "tech"), scripts/analysers (his "code"), 3D assets.
export type ProductCategory = "Blender Plugins" | "Tools & Scripts" | "3D Assets";

export interface Product {
  slug: string;
  title: string;
  tagline: string;
  category: ProductCategory;
  price: number; // 0 = free
  thumbTint: string;
  gallery: { tint: string; label: string }[];
  description: string[];
  features: string[];
  compatibility: string;
  version: string;
  changelog: { version: string; date: string; notes: string }[];
  licenseTiers: LicenseTier[];
  /** direct = Lemon Squeezy checkout here · external = link out to the platform store. */
  buyMode: "direct" | "external";
  externalUrl?: string;
  externalLabel?: string;
  maker: string; // artist slug
  status: "available" | "coming-soon";
}

// ─── Platform metadata (badge colors + labels) ───────────────────────────────

export const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  youtube:     { label: "YouTube",    color: "#ff5b4d" },
  patreon:     { label: "Patreon",    color: "#ff7864" },
  instagram:   { label: "Instagram",  color: "#e1306c" },
  tiktok:      { label: "TikTok",     color: "#69d2e7" },
  gumroad:     { label: "Gumroad",    color: "#ff90e8" },
  superhive:   { label: "SuperHive",  color: "#f5a623" },
  fab:         { label: "Fab",        color: "#9a7bff" },
  kickstarter: { label: "Kickstarter",color: "#05ce78" },
  discord:     { label: "Discord",    color: "#7289da" },
  bhi:         { label: "Blue Horizon", color: "#58d6ff" },
};

/** TODO(alex): replace with the real profile URLs. */
export const SOCIAL_LINKS: { platform: Platform; href: string }[] = [
  { platform: "youtube",     href: "https://youtube.com/@bluehorizoninteractive" },
  { platform: "patreon",     href: "https://patreon.com/bluehorizoninteractive" },
  { platform: "instagram",   href: "https://instagram.com/bluehorizoninteractive" },
  { platform: "tiktok",      href: "https://tiktok.com/@bluehorizoninteractive" },
  { platform: "gumroad",     href: "https://bluehorizon.gumroad.com" },
  { platform: "superhive",   href: "https://superhivemarket.com" },
  { platform: "fab",         href: "https://fab.com" },
  { platform: "discord",     href: "https://discord.gg" },
];

// ─── Artists (curated roster — placeholder bios) ─────────────────────────────

export const ARTISTS: Artist[] = [
  {
    slug: "alex-sheridan",
    name: "Alex Sheridan",
    role: "Founder · Director",
    initials: "AS",
    avatarTint: "from-[#0a2a6b] to-[#1a9fff]",
    bio: "Visual software architect. Games, tools and the technology that renders them — design first, always.",
    longBio: [
      "Alex founded Blue Horizon Interactive to build games and tools that feel like a glimpse of what's next. The studio's work spans real-time experiences in Unreal Engine, motion design, and the pipelines that connect them.",
      "Current focus: Codename Lyra — a first-person multiplayer horror game in Unreal Engine 5 — alongside a growing family of Blender plugins and the tools that render it all.",
    ],
    socials: [
      { platform: "youtube", href: "https://youtube.com/@bluehorizoninteractive" },
      { platform: "patreon", href: "https://patreon.com/bluehorizoninteractive" },
      { platform: "instagram", href: "https://instagram.com/bluehorizoninteractive" },
      { platform: "tiktok", href: "https://tiktok.com/@bluehorizoninteractive" },
    ],
    portfolio: [
      { label: "Beacon hero — WebGL", tint: "from-[#0a2a6b] via-[#123fd0] to-[#1a9fff]", medium: "Game art", span: "sm:col-span-2 sm:row-span-2" },
      { label: "Planet plate — Blender", tint: "from-[#062036] to-[#0e7bd0]", medium: "Cinematics" },
      { label: "Bolted — hard-surface kit", tint: "from-[#08324a] to-[#1a9fff]", medium: "Plugins" },
      { label: "Brand system", tint: "from-[#0a1f5c] to-[#2e6bff]", medium: "Illustration" },
      { label: "Codename Lyra — lighting study", tint: "from-[#241056] to-[#5b30c0]", medium: "Game art" },
    ],
    featured: true,
  },
  {
    slug: "fionn",
    name: "Fionn",
    role: "Animation",
    initials: "F",
    avatarTint: "from-[#241056] to-[#5b30c0]",
    bio: "Character and motion. Makes things move like they mean it.",
    socials: [{ platform: "instagram", href: "https://instagram.com" }],
    portfolio: [
      { label: "Character locomotion set", tint: "from-[#241056] to-[#5b30c0]", medium: "Game art", span: "sm:col-span-2" },
      { label: "Horizon Shorts — ep. 2", tint: "from-[#2a1060] to-[#7b4dd0]", medium: "Cinematics" },
      { label: "Creature study", tint: "from-[#101c4a] to-[#2e9bff]", medium: "Illustration" },
    ],
  },
];

// ─── Products (marketplace — placeholder catalogue) ──────────────────────────

export const PRODUCTS: Product[] = [
  // ── Alex's real catalogue — STUBS. Fill the TODO fields, add real gallery art,
  //    set pricing + licence tiers, then flip status to "available" to go live.
  //    Version + changelog are the "update history" buyers see; the STORE platform
  //    (Lemon Squeezy / Gumroad) delivers the actual updated file to purchasers.
  {
    slug: "bhi-blender-plugin",
    title: "Blue Horizon — Blender Plugin", // TODO: real product name
    tagline: "TODO: one line on what the plugin does for you.",
    category: "Blender Plugins",
    price: 0, // TODO: pricing (free base + paid tiers? single price?)
    thumbTint: "from-[#0a2a6b] via-[#123fd0] to-[#1a9fff]",
    gallery: [{ tint: "from-[#0a2a6b] to-[#1a9fff]", label: "TODO — plugin screenshot" }],
    description: ["TODO: what it does, who it's for, how it fits a Blender workflow."],
    features: ["TODO: key feature", "TODO: key feature"],
    compatibility: "Blender 4.2+", // TODO: confirm versions
    version: "0.1.0",
    changelog: [{ version: "0.1.0", date: "2026-07-18", notes: "Placeholder listing created." }],
    licenseTiers: [{ name: "TODO tier", price: 0 }],
    buyMode: "direct",
    maker: "alex-sheridan",
    status: "coming-soon",
  },
  {
    slug: "bhi-blender-analyser",
    title: "Blue Horizon — Blender Analyser", // TODO: real name
    tagline: "TODO: what the analyser inspects / reports on.",
    category: "Tools & Scripts",
    price: 0, // TODO
    thumbTint: "from-[#062036] to-[#0e7bd0]",
    gallery: [{ tint: "from-[#062036] to-[#0e7bd0]", label: "TODO — analyser screenshot" }],
    description: ["TODO: the problem it solves and what it outputs."],
    features: ["TODO: key feature", "TODO: key feature"],
    compatibility: "Blender 4.2+", // TODO
    version: "0.1.0",
    changelog: [{ version: "0.1.0", date: "2026-07-18", notes: "Placeholder listing created." }],
    licenseTiers: [{ name: "TODO tier", price: 0 }],
    buyMode: "direct",
    maker: "alex-sheridan",
    status: "coming-soon",
  },
  {
    slug: "bhi-door-pack",
    title: "Sci-fi Door Pack", // TODO: real name — built from the unfinished doors
    tagline: "TODO: a set of game-ready sci-fi doors.",
    category: "3D Assets",
    price: 0, // TODO
    thumbTint: "from-[#08324a] to-[#1a9fff]",
    gallery: [{ tint: "from-[#08324a] to-[#1a9fff]", label: "TODO — door renders" }],
    description: ["TODO: how many doors, formats, poly range, textures, engine-ready?"],
    features: ["TODO: N doors", "TODO: formats (FBX/GLTF)", "TODO: PBR textures"],
    compatibility: "Blender · FBX / glTF export", // TODO
    version: "0.1.0",
    changelog: [{ version: "0.1.0", date: "2026-07-18", notes: "Placeholder listing created." }],
    licenseTiers: [{ name: "TODO tier", price: 0 }],
    buyMode: "direct",
    maker: "alex-sheridan",
    status: "coming-soon",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getArtist = (slug?: string) => ARTISTS.find((a) => a.slug === slug);
export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productsBy = (maker: string) => PRODUCTS.filter((p) => p.maker === maker);
export const feedBy = (author: string) => FEED.filter((f) => f.author === author);
export const firstPartyPosts = () => FEED.filter((f) => f.type === "post" && f.slug);

export const formatPrice = (n: number) => (n === 0 ? "Free" : `€${n}`);

export function relTime(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  if (s < 2629800) return `${Math.floor(s / 604800)}w ago`;
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}
