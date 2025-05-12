// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  experimental: {
    // Habilitar la bandera experimental de sesiones
    session: true
  },
  adapter: netlify(),
});
