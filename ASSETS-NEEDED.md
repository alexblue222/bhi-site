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

**8. Live feed** — ✅ **YouTube is LIVE** (key + channel id set, Worker deployed, `/feed` pulls real
uploads). **Patreon + Instagram fetchers are now BUILT** but inert until their creds are set — follow
`hub-worker/API-SETUP.md` (Patreon: register a client → 3 secrets; Instagram: Business/Creator account
+ Meta app → 1 token). TikTok still deferred.

**9. CMS activation** — Sveltia CMS + Worker OAuth proxy exist but return 503 until the private
repo + fine-grained PAT + two Cloudflare Access apps + Worker secrets are set (see
`hub-worker/README.md`). Do this and you (and the team) can edit all the above through `/admin`.

**10. Marketplace** — now in the nav. Products in `src/lib/data.ts`:
- ✅ **Visual Keyboard Editor** (Blender Plugins) — **LIVE, free**. Real listing (name, copy,
  features, v0.1.0) with a working **Download** of `public/downloads/keyboard_proto-0.1.0.zip`.
  Description now emphasises it **works with your other add-ons** and that it's a WIP (report bugs).
  *Screenshots:* the gallery is wired for 3 images — drop them in
  `public/products/visual-keyboard-editor/` as `01-keyboard.png` / `02-inspect.png` / `03-addons.png`
  (see the `_DROP-SCREENSHOTS-HERE.txt` there). Falls back to gradients until they land.
  When you rebuild the plugin, drop the new zip in `public/downloads/` + bump `version` + `changelog`.

**11. Product community features (deferred — Alex's ask)** — on each product page:
- **Comment area** — users comment on the product. Needs a comments backend (or an embed).
- **Problem/complaint reporting** — a user logs a technical issue; Alex fixes it and can reply with
  the solution. Needs a form + storage + reply/notify flow (candidate: the hub Worker or an issue
  tracker). Both intentionally held for later.
- ⏳ **Blue Horizon — Blender Analyser** (Tools & Scripts) — stub, `coming-soon`.
- ⏳ **Sci-fi Door Pack** (3D Assets — from the unfinished doors) — stub, `coming-soon`.

Each needs from you: real **name + tagline + description + features**, **pricing / licence tiers**,
**compatibility**, and **gallery art** (screenshots/renders — a small `image` field still needs adding
to the gallery type; currently gradient placeholders). The **version + changelog** fields are already
there — that's the "update history" buyers see; the actual updated file is delivered by the store
platform (**Lemon Squeezy** direct, or Gumroad) when you upload a new version. To go live per product:
fill the fields → add art → set `status: "available"` → wire the Lemon Squeezy checkout.

---

*Everything above is content/config, not code. The pages, components, validation, image fallbacks,
SEO, and the CMS pipeline are all in place and waiting for these to drop in.*
