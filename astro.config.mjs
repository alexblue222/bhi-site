// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Canonical origin — powers absolute canonical + og:image URLs in Layout.astro.
  site: 'https://bluehorizoninteractive.com',

  // Build-time HTML compression strips whitespace text nodes inside React island
  // markup → hydration mismatch (#418). Gzip makes compression moot anyway.
  compressHTML: false,

  // IA rename (2026-07): Games→Studio, Artists→Creators. Old paths keep working.
  redirects: {
    '/games': '/studio',
    '/artists': '/creators',
    '/artists/[slug]': '/creators/[slug]',
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});