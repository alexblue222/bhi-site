// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Build-time HTML compression strips whitespace text nodes inside React island
  // markup → hydration mismatch (#418). Gzip makes compression moot anyway.
  compressHTML: false,

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});