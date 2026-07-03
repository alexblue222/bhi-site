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
  media?: { tint: string; label?: string; aspect?: "video" | "square" | "wide"; duration?: string };
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

export type ProductCategory = "Blender plugins" | "3D assets" | "Shaders & materials" | "Tools & presets";

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
      "Current focus: Project Aurora, the Beacon Engine web renderer, and a growing family of Blender plugins.",
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
      { label: "Aurora lighting study", tint: "from-[#241056] to-[#5b30c0]", medium: "Game art" },
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
  {
    slug: "pablo",
    name: "Pablo",
    role: "3D Artist",
    initials: "P",
    avatarTint: "from-[#062a4d] to-[#0e7bd0]",
    bio: "Environments and hard-surface. Builds the places the games happen in.",
    socials: [{ platform: "instagram", href: "https://instagram.com" }],
    portfolio: [
      { label: "Station exterior", tint: "from-[#062a4d] to-[#0e7bd0]", medium: "Game art", span: "sm:col-span-2" },
      { label: "Env kit — modular halls", tint: "from-[#08324a] to-[#1a9fff]", medium: "Game art" },
      { label: "Prop pass — Aurora", tint: "from-[#0a1f5c] to-[#2e6bff]", medium: "Game art" },
    ],
  },
  {
    slug: "bon",
    name: "Bon",
    role: "Illustration & Art",
    initials: "B",
    avatarTint: "from-[#5c2a10] to-[#ffb347]",
    bio: "Key art, illustration and the warmer end of the palette.",
    socials: [{ platform: "instagram", href: "https://instagram.com" }],
    portfolio: [
      { label: "Aurora key art", tint: "from-[#5c2a10] to-[#ffb347]", medium: "Illustration", span: "sm:col-span-2 sm:row-span-2" },
      { label: "Poster series", tint: "from-[#3a1c08] to-[#ff9e6b]", medium: "Illustration" },
      { label: "Character portraits", tint: "from-[#241056] to-[#5b30c0]", medium: "Illustration" },
    ],
  },
];

// ─── Products (marketplace — placeholder catalogue) ──────────────────────────

export const PRODUCTS: Product[] = [
  {
    slug: "bolted-hard-surface-kit",
    title: "Bolted — Hard-Surface Kit",
    tagline: "Procedural bolts, panels and greebles for Blender hard-surface work.",
    category: "Blender plugins",
    price: 24,
    thumbTint: "from-[#08324a] to-[#1a9fff]",
    gallery: [
      { tint: "from-[#08324a] to-[#1a9fff]", label: "Panel workflow" },
      { tint: "from-[#062036] to-[#0e7bd0]", label: "Bolt library" },
      { tint: "from-[#0a1f5c] to-[#2e6bff]", label: "Boolean utilities" },
    ],
    description: [
      "Bolted gives you a non-destructive hard-surface workflow: drop procedural bolts, panel cuts and greeble sets onto any mesh and keep everything editable.",
      "Built in production on Blue Horizon's own projects — every tool exists because we needed it.",
    ],
    features: ["Procedural bolt + panel generators", "Non-destructive boolean utilities", "Greeble scatter with seed control", "Preset library, expandable with your own"],
    compatibility: "Blender 4.2+ (LTS) · Windows / macOS / Linux",
    version: "1.2.0",
    changelog: [
      { version: "1.2.0", date: "2026-06-28", notes: "Greeble scatter v2, per-face density maps." },
      { version: "1.1.0", date: "2026-05-16", notes: "Panel-cut bevel profiles, preset import/export." },
      { version: "1.0.0", date: "2026-04-02", notes: "First release." },
    ],
    licenseTiers: [
      { name: "Personal", price: 24, note: "1 seat, all updates" },
      { name: "Studio", price: 72, note: "5 seats, priority support" },
    ],
    buyMode: "direct",
    maker: "alex-sheridan",
    status: "available",
  },
  {
    slug: "beacon-light-presets",
    title: "Beacon — Light & Render Presets",
    tagline: "The Blue Horizon look: volumetric beams, atmosphere rims, city-light glows.",
    category: "Tools & presets",
    price: 12,
    thumbTint: "from-[#03203a] to-[#3aa0ff]",
    gallery: [
      { tint: "from-[#03203a] to-[#3aa0ff]", label: "Beam presets" },
      { tint: "from-[#0a2a6b] to-[#123fd0]", label: "Atmosphere rims" },
    ],
    description: [
      "Every glow on this website started as one of these presets. World setups, bloom chains and emission rigs for the signature electric-blue look.",
    ],
    features: ["12 world + compositor setups", "Atmosphere rim emission rigs", "Bloom/glare chains tuned for EEVEE", "One-click apply"],
    compatibility: "Blender 4.2+ · EEVEE & Cycles",
    version: "1.0.1",
    changelog: [{ version: "1.0.1", date: "2026-06-12", notes: "Cycles parity pass." }, { version: "1.0.0", date: "2026-05-30", notes: "First release." }],
    licenseTiers: [{ name: "Personal", price: 12 }],
    buyMode: "direct",
    maker: "alex-sheridan",
    status: "available",
  },
  {
    slug: "horizon-shader-pack",
    title: "Horizon — Procedural Shader Pack",
    tagline: "Sci-fi surfaces: brushed panels, emissive circuitry, worn metals.",
    category: "Shaders & materials",
    price: 18,
    thumbTint: "from-[#101c4a] to-[#2e9bff]",
    gallery: [{ tint: "from-[#101c4a] to-[#2e9bff]", label: "Material spheres" }],
    description: ["Twenty procedural materials designed for dark, backlit sci-fi scenes. No textures to manage — everything is nodes."],
    features: ["20 procedural materials", "Wear + edge-damage controls", "Emissive circuitry generator"],
    compatibility: "Blender 4.0+",
    version: "2.1.0",
    changelog: [{ version: "2.1.0", date: "2026-06-20", notes: "Anisotropy controls." }],
    licenseTiers: [{ name: "Personal", price: 18 }],
    buyMode: "external",
    externalUrl: "https://bluehorizon.gumroad.com",
    externalLabel: "Buy on Gumroad",
    maker: "pablo",
    status: "available",
  },
  {
    slug: "planet-plate-collection",
    title: "Planet Plates — 4K Render Collection",
    tagline: "Cinematic planet rims, atmospheres and horizons, rendered on black.",
    category: "3D assets",
    price: 9,
    thumbTint: "from-[#062036] to-[#0e7bd0]",
    gallery: [{ tint: "from-[#062036] to-[#0e7bd0]", label: "Plate previews" }],
    description: ["The planet from our own hero, and friends: 4K frame sequences and stills on pure black, ready for screen-blend compositing anywhere."],
    features: ["6 planets, 4K PNG", "Frame sequences + stills", "Screen-blend ready (black background)"],
    compatibility: "Any compositor / engine",
    version: "1.0.0",
    changelog: [{ version: "1.0.0", date: "2026-06-01", notes: "First release." }],
    licenseTiers: [{ name: "Personal", price: 9 }],
    buyMode: "external",
    externalUrl: "https://superhivemarket.com",
    externalLabel: "Buy on SuperHive",
    maker: "alex-sheridan",
    status: "available",
  },
  {
    slug: "rocket-anim-rig",
    title: "Rocket — Launch Anim Rig",
    tagline: "The little ship from our logo, rigged and ready to fly.",
    category: "3D assets",
    price: 0,
    thumbTint: "from-[#0a1f5c] to-[#2e6bff]",
    gallery: [{ tint: "from-[#0a1f5c] to-[#2e6bff]", label: "Rig preview" }],
    description: ["A free thank-you to the community: the Blue Horizon rocket, rigged with trail controls and a launch action."],
    features: ["Rigged ship + trail controls", "Launch action included", "CC-BY licensed"],
    compatibility: "Blender 4.0+",
    version: "1.0.0",
    changelog: [{ version: "1.0.0", date: "2026-05-10", notes: "First release." }],
    licenseTiers: [{ name: "Free", price: 0 }],
    buyMode: "direct",
    maker: "fionn",
    status: "available",
  },
  {
    slug: "aurora-ui-kit",
    title: "Aurora — Game UI Kit",
    tagline: "The diegetic interface language of Project Aurora, as a reusable kit.",
    category: "Tools & presets",
    price: 29,
    thumbTint: "from-[#241056] to-[#5b30c0]",
    gallery: [{ tint: "from-[#241056] to-[#5b30c0]", label: "HUD frames" }],
    description: ["Coming soon — the HUD, menu and holo-panel language from Project Aurora as engine-ready components."],
    features: ["HUD + menu components", "Holo-panel shader", "Figma source included"],
    compatibility: "Unreal Engine 5.4+ · Figma",
    version: "0.9.0",
    changelog: [],
    licenseTiers: [{ name: "Personal", price: 29 }],
    buyMode: "direct",
    maker: "alex-sheridan",
    status: "coming-soon",
  },
];

// ─── Feed (placeholder aggregation stream) ───────────────────────────────────

export const FEED: FeedItem[] = [
  {
    id: "post-hub-live",
    type: "post",
    platform: "bhi",
    slug: "the-hub-is-live",
    title: "The new Blue Horizon hub is live",
    excerpt: "One place for everything we make — videos, builds, drops and art from every platform, together at last.",
    body: [
      "bluehorizoninteractive.com is no longer just a landing page. From today it's the hub: every video, devlog, plugin release and piece of art we put out — on YouTube, Patreon, the marketplaces or anywhere else — flows into the feed you're reading now.",
      "The site opens with the beacon: the planet rises, the flare ignites on the horizon, and the mark takes its place in the corner. That sequence is built with a real-time WebGL shader over frames rendered in Blender — and everything about how it was made will show up here as devlogs.",
      "Follow along on whichever platform you like. This page will always have all of it.",
    ],
    media: { tint: "from-[#0a2a6b] via-[#123fd0] to-[#1a9fff]", label: "The beacon hero", aspect: "wide" },
    author: "alex-sheridan",
    publishedAt: "2026-07-03T18:00:00Z",
    tags: ["Studio", "Announcement"],
    pinned: true,
    source: "manual",
  },
  {
    id: "yt-beacon-devlog",
    type: "video",
    platform: "youtube",
    title: "Building a WebGL beacon — Blue Horizon devlog 05",
    excerpt: "From Blender planet plates to a scroll-driven shader flare: the full hero pipeline.",
    media: { tint: "from-[#062036] to-[#0e7bd0]", label: "Devlog 05", aspect: "video", duration: "12:41" },
    sourceUrl: "https://youtube.com/@bluehorizoninteractive",
    author: "alex-sheridan",
    publishedAt: "2026-07-01T16:00:00Z",
    engagement: { views: "4.1k views" },
    source: "auto",
  },
  {
    id: "release-bolted-12",
    type: "release",
    platform: "superhive",
    title: "Bolted 1.2 — greeble scatter v2",
    excerpt: "Per-face density maps and a rebuilt scatter engine.",
    media: { tint: "from-[#08324a] to-[#1a9fff]", label: "Bolted 1.2", aspect: "square" },
    sourceUrl: "/marketplace/bolted-hard-surface-kit",
    author: "alex-sheridan",
    publishedAt: "2026-06-28T12:00:00Z",
    tags: ["€24"],
    source: "manual",
  },
  {
    id: "patreon-aurora-build",
    type: "patreon",
    platform: "patreon",
    title: "Early build: Aurora vertical slice",
    excerpt: "Patrons can download the first playable loop — beacon lighting system online, feedback thread open.",
    sourceUrl: "https://patreon.com/bluehorizoninteractive",
    author: "alex-sheridan",
    publishedAt: "2026-06-26T09:00:00Z",
    memberOnly: true,
    tags: ["Builders tier"],
    source: "auto",
  },
  {
    id: "ig-flare-breakdown",
    type: "social",
    platform: "instagram",
    title: "Beacon flare breakdown",
    excerpt: "60 seconds of the flare igniting, layer by layer.",
    media: { tint: "from-[#2a1060] to-[#5b30c0]", label: "Reel", aspect: "square" },
    sourceUrl: "https://instagram.com/bluehorizoninteractive",
    publishedAt: "2026-06-30T19:30:00Z",
    engagement: { likes: "312 likes" },
    source: "manual",
  },
  {
    id: "milestone-wishlists",
    type: "milestone",
    platform: "bhi",
    title: "18,400 wishlists",
    excerpt: "Project Aurora keeps climbing — thank you. Next stop: 25k before the next devlog drops.",
    publishedAt: "2026-06-29T08:00:00Z",
    milestone: { value: "18.4k", progress: 0.74 },
    source: "manual",
  },
  {
    id: "yt-planet-blender",
    type: "video",
    platform: "youtube",
    title: "Rendering a planet that composites itself — Blender to web",
    excerpt: "Why we render light on black and let the browser do the compositing.",
    media: { tint: "from-[#0a1f5c] to-[#2e6bff]", label: "Devlog 04", aspect: "video", duration: "9:58" },
    sourceUrl: "https://youtube.com/@bluehorizoninteractive",
    author: "alex-sheridan",
    publishedAt: "2026-06-24T16:00:00Z",
    engagement: { views: "6.8k views" },
    source: "auto",
  },
  {
    id: "post-field-notes-5",
    type: "post",
    platform: "bhi",
    slug: "field-notes-05-screen-blend",
    title: "Field Notes #05 — light on black",
    excerpt: "The one compositing trick that makes the whole site possible: screen blend, and why alpha video was never going to work.",
    body: [
      "Every glowing thing on this site — the planet, the flare, the logo itself — is an image of light on pure black, composited with mix-blend-mode: screen. Black drops out, light adds. No alpha channels, no codec fights, works in every browser.",
      "This note walks through the pipeline: rendering plates on black in Blender, keying elements that were never delivered with transparency, and the GLSL flare that replaced a whole folder of PNGs.",
      "Field Notes is our engineering-notebook series — the real decisions, including the wrong turns.",
    ],
    media: { tint: "from-[#10314f] to-[#3aa0ff]", label: "Field Notes", aspect: "wide" },
    author: "alex-sheridan",
    publishedAt: "2026-06-22T10:00:00Z",
    tags: ["Engineering", "Field Notes"],
    source: "manual",
  },
  {
    id: "tiktok-rocket",
    type: "social",
    platform: "tiktok",
    title: "The rocket has one job",
    excerpt: "POV: you're the little ship in the logo.",
    media: { tint: "from-[#062a4d] to-[#0e7bd0]", label: "Clip", aspect: "square" },
    sourceUrl: "https://tiktok.com/@bluehorizoninteractive",
    publishedAt: "2026-06-21T20:00:00Z",
    engagement: { likes: "1.2k likes" },
    source: "manual",
  },
  {
    id: "release-shader-pack",
    type: "release",
    platform: "gumroad",
    title: "Horizon Shader Pack 2.1",
    excerpt: "Anisotropy controls for every metal in the pack.",
    media: { tint: "from-[#101c4a] to-[#2e9bff]", label: "Shaders 2.1", aspect: "square" },
    sourceUrl: "/marketplace/horizon-shader-pack",
    author: "pablo",
    publishedAt: "2026-06-20T12:00:00Z",
    tags: ["€18"],
    source: "manual",
  },
  {
    id: "patreon-field-notes-early",
    type: "patreon",
    platform: "patreon",
    title: "Field Notes #06 — early access",
    excerpt: "Next week's engineering note is up early for patrons: the header hand-off, measured to the pixel.",
    sourceUrl: "https://patreon.com/bluehorizoninteractive",
    author: "alex-sheridan",
    publishedAt: "2026-06-19T09:00:00Z",
    memberOnly: true,
    tags: ["All tiers"],
    source: "auto",
  },
  {
    id: "yt-bolted-tutorial",
    type: "video",
    platform: "youtube",
    title: "Hard-surface in 20 minutes with Bolted",
    excerpt: "A full prop, start to finish, using only the kit.",
    media: { tint: "from-[#08324a] to-[#1a9fff]", label: "Tutorial", aspect: "video", duration: "21:07" },
    sourceUrl: "https://youtube.com/@bluehorizoninteractive",
    author: "alex-sheridan",
    publishedAt: "2026-06-15T16:00:00Z",
    engagement: { views: "11k views" },
    source: "auto",
  },
  {
    id: "milestone-discord",
    type: "milestone",
    platform: "discord",
    title: "5,000 in the Discord",
    excerpt: "The community crossed five thousand builders, artists and players.",
    publishedAt: "2026-06-12T08:00:00Z",
    milestone: { value: "5k", progress: 1 },
    source: "manual",
  },
  {
    id: "ig-aurora-key-art",
    type: "social",
    platform: "instagram",
    title: "Aurora key art — process",
    excerpt: "Bon's key art, from thumbnail to final. Warm light finally enters the palette.",
    media: { tint: "from-[#5c2a10] to-[#ffb347]", label: "Key art", aspect: "square" },
    sourceUrl: "https://instagram.com/bluehorizoninteractive",
    author: "bon",
    publishedAt: "2026-06-10T18:00:00Z",
    engagement: { likes: "540 likes" },
    source: "manual",
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
