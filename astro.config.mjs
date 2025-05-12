// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: netlify({
    // Deshabilitar las sesiones para evitar el error
    blobsSession: false
  }),
});
