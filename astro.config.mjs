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

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});