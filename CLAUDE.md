# Blue Horizon Interactive — website

**Read [`PROJECT.md`](./PROJECT.md) first** — the brand, mission, locked decisions (Astro · Cloudflare
Pages · Lemon Squeezy), information architecture, roadmap, and build conventions. It's the north star.

**Doing UI/design work?** Read [`DESIGN-SKILLS.md`](./DESIGN-SKILLS.md) — which installed design skills
(`frontend-design`, `design-taste-frontend`, `ui-ux-pro-max`, `shadcn`, the `gsap-*` suite, etc.) to use
on this site, in what order, and how they map to the established BHI brand/stack. (Mobile/native skills
don't apply here.)

🔒 Never touch `lab.` / `api.` subdomains or the Notion token (Alex's private backend). Public commerce
uses its own subdomain (e.g. `shop.`). Deploy previews with a non-`main` `--branch`; promote to `main` only when approved.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
