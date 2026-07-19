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
  gallery: { tint: string; label: string; image?: string }[]; // image overlays the tint when set
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
    slug: "visual-keyboard-editor",
    title: "Visual Keyboard Editor",
    tagline: "See and rebind every shortcut visually — including add-ons.",
    category: "Blender Plugins",
    price: 0, // free — the open base of the Blue Horizon plugin family (GPL-3.0)
    thumbTint: "from-[#0a2a6b] via-[#123fd0] to-[#1a9fff]",
    gallery: [
      { tint: "from-[#0a2a6b] via-[#123fd0] to-[#1a9fff]", label: "The visual keyboard", image: "/products/visual-keyboard-editor/01-keyboard.png" },
      { tint: "from-[#062036] to-[#0e7bd0]", label: "Every shortcut on a key", image: "/products/visual-keyboard-editor/02-inspect.png" },
      { tint: "from-[#0a1f5c] to-[#2e6bff]", label: "Works with your other add-ons", image: "/products/visual-keyboard-editor/03-addons.png" },
    ],
    description: [
      "See your whole keyboard at a glance. Visual Keyboard Editor draws Blender's shortcuts as a real, colour-coded keyboard — bound keys lit, empty keys dark — with Ctrl / Alt / Shift filters, so you can see exactly what every key does in every mode.",
      "It works with all your other add-ons — that's the whole point. It doesn't just show Blender's built-in shortcuts; it reads every add-on you have installed. BoolTool, MachineTools, Node Wrangler — whatever you run, their operators and shortcuts all show up here, filterable by add-on, so you finally have one place to see and organise everything you've got.",
      "Rebind anything, safely. Click a key to inspect every operator on it across all your modifiers, then change, disable or add a shortcut — including Blender's own native ones and those added by add-ons. Every edit is reversible, and your bindings persist across restarts.",
      "Find the command, not the key. Underneath sits a searchable library of every action in your Blender (2,800+ and counting) — filter by add-on or category, favourite the ones you use, hide the noise, and bind a shortcut straight from the list.",
      "A work in progress. This is an early, free release and still growing — if you hit a bug or something feels off, please send it in and I'll get it fixed and pushed out as an update. (A spot to report problems and leave comments is coming to this page.)",
      "Free and open. The open base of the Blue Horizon plugin family — GPL-3.0, no account, no catch. Paid modules build on top of it.",
    ],
    features: [
      "Full visual keyboard — colour-coded, GPU-drawn",
      "Rebind native + add-on shortcuts, reversibly",
      "Searchable action library (favourite · pin · hide)",
      "Click-to-bind straight from the library",
      "Bindings persist across restarts",
      "Conflict detection built in",
    ],
    compatibility: "Blender 4.2+ · Windows / macOS / Linux",
    version: "0.1.0",
    changelog: [
      { version: "0.1.0", date: "2026-06-29", notes: "First release — visual keyboard, native + add-on rebinding, searchable action library." },
    ],
    licenseTiers: [{ name: "Free", price: 0, note: "GPL-3.0 · free forever" }],
    buyMode: "external",
    externalUrl: "/downloads/keyboard_proto-0.1.0.zip",
    externalLabel: "Download — free",
    maker: "alex-sheridan",
    status: "available",
  },
  {
    slug: "mesh-inspector",
    title: "Mesh Inspector",
    tagline: "Drag in FBX, .blend, OBJ or GLB and get a clean report on every mesh.",
    category: "Tools & Scripts",
    price: 0, // free
    thumbTint: "from-[#1a1a2e] to-[#3a2f7d]",
    gallery: [
      { tint: "from-[#161a2e] to-[#3a2f7d]", label: "Analyse a whole folder — a thumbnail + report per file", image: "/products/mesh-inspector/01-list.png" },
      { tint: "from-[#161a2e] to-[#2a3f7d]", label: "Expand any file for a full per-object breakdown", image: "/products/mesh-inspector/02-objects.png" },
      { tint: "from-[#062036] to-[#0e7bd0]", label: "Verts, tris, materials, manifold, rig & bounds", image: "/products/mesh-inspector/03-detail.png" },
    ],
    description: [
      "Know what a mesh file actually is — before you open it. Mesh Inspector is a drag-and-drop desktop app that reads FBX, .blend, OBJ and GLB files and gives you a clean report on each: object count, verts and tris, materials, manifold status, bounding size, and whether it's rigged or has shape keys — with a rendered thumbnail so you can see it at a glance.",
      "Built for bulk. Drop a whole folder of unknown or badly-named files and get a row for every one, each expandable to a full per-object breakdown, and export the lot to CSV. It's the fastest way to identify, sort and tidy a messy library of 3D files.",
      "Every common format. FBX, .blend, OBJ and GLB / glTF. For .blend and FBX it drives Blender under the hood, so the stats are real geometry — not guesses. (Optional: get an AI-suggested name for mystery files.)",
      "Needs Blender installed. Mesh Inspector uses your Blender to open .blend / FBX files — it finds Blender automatically, or you point it at blender.exe once. Windows app, free.",
      "A work in progress. This is an early release and still being tidied up — if you hit a bug, send it in and I'll get it fixed. (Comments + a report-a-problem spot are coming to this page.)",
    ],
    features: [
      "Reads FBX · .blend · OBJ · GLB / glTF",
      "Per-file report + rendered thumbnail",
      "Per-object stats: verts, tris, materials, manifold, rig, shape keys",
      "Bulk drag-and-drop — a whole folder at once",
      "Export everything to CSV",
      "Optional AI name suggestions for unnamed files",
    ],
    compatibility: "Windows · requires Blender installed",
    version: "1.0.0",
    changelog: [
      { version: "1.0.0", date: "2026-07-19", notes: "First public release — bulk analysis, per-object stats, thumbnails, CSV export." },
    ],
    licenseTiers: [{ name: "Free", price: 0, note: "Windows · Blender required" }],
    buyMode: "external",
    externalUrl: "https://bluehorizon.gumroad.com", // TODO: point at the exact Gumroad product URL once uploaded
    externalLabel: "Get it free (Windows)",
    maker: "alex-sheridan",
    status: "coming-soon", // launch state — flip to "available" once the installer is on Gumroad + externalUrl points at it
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
