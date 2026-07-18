# Assets & real content still needed

The site's structure, components and image pipeline are built and **turnkey** — every visible
surface already prefers a real image and falls back to a gradient tile until one exists. What's
left is *content only*: things I can't invent (your real photos, video URLs, team facts, handles).
Drop each item in at the location listed and it goes live automatically.

Image drop zone: put files in `public/uploads/…` (the CMS media folder) and reference them with a
`/uploads/…` path. Or edit these through the Sveltia CMS at `/admin` once it's activated.

---

## 🔴 High — the site reads as placeholder until these land

**1. Real pinned-video URLs** — the two feed pins point at fake YouTube IDs.
- `src/content/pins/devlog-05-beacon.yml` → `url:` (currently `…watch?v=bHIbeacon05`)
- `src/content/pins/bolted-tutorial.yml` → `url:`
- Once real, the feed auto-derives the thumbnail from the video — no image upload needed.

**2. Real social handles** — the Connect module + footer link to bare homepages / a dead invite.
- `src/lib/data.ts` → `SOCIAL_LINKS` (marked `TODO(alex)`): youtube, patreon, instagram, tiktok,
  gumroad, superhive, fab, **discord** (currently `https://discord.gg` with no invite code = dead).

**3. Team bios + avatars** — Fionn / Pablo / Bon are one-line placeholders with no photo.
- Bios: `src/content/artists/{fionn,pablo,bon}.md` → the `bio:` field **and** the markdown body.
  (I won't write these — they're real facts about real people. A few sentences each.)
- Avatars: same files → add `avatarImage: /uploads/artists/fionn.jpg` (etc.). Optional; falls back
  to the coloured initial.
- Their `socials:` currently all point at bare `https://instagram.com` — swap for real profiles.

---

## 🟠 Medium — makes the portfolio/games pages sing

**4. Game names + cover art** — `/games` shows real structure but placeholder identities.
- `src/components/home/HubSections.tsx` → `GAMES` array: real `title` (esp. **"Untitled RPG"**),
  refined `pitch`/`longPitch`, and `cover: "/uploads/games/aurora.jpg"` per game (a screenshot —
  replaces the gradient automatically).

**5. Portfolio thumbnails** — every portfolio piece is a labelled gradient.
- Per-artist `portfolio[].image` in `src/content/artists/*.md` → `/uploads/portfolio/…` paths.
  (Alex's own roster in `alex-sheridan.md` first — it's the featured profile.)

**6. Blog hero images** — the 2 posts render gradient heroes.
- `src/content/blog/*.md` frontmatter → `heroImage: /uploads/blog/…` (optional; gradient is fine).

---

## 🟡 Later — needs a decision or a backend, not just a file

**7. Contact form delivery** — the form works today via a prefilled mailto. To make it a real
async submit, pick an email/forms provider and set `PUBLIC_CONTACT_ENDPOINT` (env), or add a
`/contact` POST route to the hub Worker. *Decision needed: which provider.*

**8. Live feed (YouTube)** — the hub Worker's YouTube integration is written but returns empty
until `YOUTUBE_API_KEY` + `YOUTUBE_CHANNEL_ID` are set (Worker secrets/vars). Flip-a-switch.
Patreon / Instagram / TikTok fetchers are *not built yet* — separate work.

**9. CMS activation** — Sveltia CMS + Worker OAuth proxy exist but return 503 until the private
repo + fine-grained PAT + two Cloudflare Access apps + Worker secrets are set (see
`hub-worker/README.md`). Do this and you (and the team) can edit all the above through `/admin`.

**10. Marketplace (only when the store goes live)** — products are placeholder and hidden from nav.
Needs: Lemon Squeezy store + checkout, license/download delivery, and a small `image` field added
to the product/gallery type (currently gradient-only). Not started — this is the P4 roadmap item.

---

*Everything above is content/config, not code. The pages, components, validation, image fallbacks,
SEO, and the CMS pipeline are all in place and waiting for these to drop in.*
