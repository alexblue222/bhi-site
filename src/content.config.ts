// ─── Content collections — the git half of the hub (edited via Sveltia /admin) ─
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    /** Card excerpt shown in the feed. */
    description: z.string(),
    /** Artist slug. */
    author: z.string().default("alex-sheridan"),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    /** Tailwind gradient classes, e.g. 'from-[#0a2a6b] to-[#1a9fff]'. */
    heroTint: z.string().optional(),
    /** /uploads/... path. */
    heroImage: z.string().optional(),
    /** YouTube video URL to embed. */
    youtube: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/artists" }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    initials: z.string(),
    avatarTint: z.string(),
    avatarImage: z.string().optional(),
    bio: z.string(),
    socials: z
      .array(z.object({ platform: z.string(), href: z.string() }))
      .default([]),
    portfolio: z
      .array(
        z.object({
          label: z.string(),
          tint: z.string(),
          image: z.string().optional(),
          medium: z.enum(["Game art", "Cinematics", "Plugins", "Illustration"]),
          span: z.string().optional(),
        }),
      )
      .default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const pins = defineCollection({
  loader: glob({ pattern: "**/*.{yml,yaml}", base: "./src/content/pins" }),
  schema: z.object({
    url: z.string().url(),
    title: z.string(),
    note: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { blog, artists, pins };
