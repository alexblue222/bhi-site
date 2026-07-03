# BHI Admin — how to edit the site

This is the guide for editing bluehorizoninteractive.com content. No coding, no GitHub —
everything happens in your browser at the admin panel.

## Logging in

1. Go to **https://bluehorizoninteractive.com/admin**
2. You'll hit a Cloudflare Access screen first. Enter your **work email** and click
   *Send me a code*.
3. Check your inbox, paste the 6-digit code. That's it — you're in the CMS.

If the code never arrives or you get "access denied", your email isn't on the allow-list
yet — ask Alex to add you.

Everything you publish is saved automatically to the site's private repository and goes
live after the site rebuilds (usually a minute or two).

## Adding a blog post / devlog

1. In the left sidebar, click **Blog**, then **New Post**.
2. Fill in:
   - **Title** — the headline.
   - **Description** — one or two sentences; this is the excerpt shown on feed cards.
   - **Author** — your artist slug (the short name of your artist profile, e.g.
     `alex-sheridan`, `fionn`).
   - **Published at** — date/time of publication.
   - **Tags** — optional keywords (e.g. `devlog`, `tutorial`).
   - **Hero image** — optional; upload a cover image.
   - **Hero tint** — optional; only if you know the Tailwind gradient you want. Leave
     blank for the default blue.
   - **YouTube** — optional; paste a video URL to embed it in the post.
   - **Body** — the post itself. Full rich text: headings, images, links, lists.
3. Leave **Draft** off when you're ready for it to go live (turn it on to save without
   publishing).
4. Click **Save**, then **Publish**.

## Adding yourself as an artist

1. Sidebar → **Artists** → **New Artist**.
2. Fill in:
   - **Name**, **Role** (e.g. "Animation", "Environment art"), **Initials** (shown on
     your avatar if there's no photo).
   - **Avatar image** — optional portrait/avatar upload.
   - **Avatar tint** — the gradient behind your initials; copy one from an existing
     artist entry if unsure.
   - **Bio** — one short line for your card.
   - **Socials** — add a row per link: pick the platform, paste the URL.
   - **Portfolio** — add a row per piece: label, medium, optional image. Leave *Tint*
     and *Span* alone unless you know what you want.
   - **Order** — position in the roster (lower = earlier). Ask Alex if unsure.
   - **Long bio** — the full text for your profile page.
3. Leave **Featured** off — Alex manages that.
4. Save and publish.

## Pinning a video to the feed

Pins are hand-picked items that sit at the top of the feed.

1. Sidebar → **Pins** → **New Pin**.
2. Paste the **URL** (YouTube works best right now; Instagram/Patreon links show as
   link cards).
3. Give it a **Title**, an optional **Note**, and an **Order** (0 shows first).
4. Save and publish. To unpin, delete the entry.

## Not working yet?

The admin panel depends on the hub service (`hub.bluehorizoninteractive.com`) for login
and saving. If `/admin` loads but sign-in or saving fails, that service isn't activated
yet — see **`hub-worker/README.md`** in the repository (or ask Alex) for the activation
steps.
