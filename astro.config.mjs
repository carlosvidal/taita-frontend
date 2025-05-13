// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  experimental: {
    // Habilitar la bandera experimental de sesiones
    session: true
  },
  adapter: node({
    mode: 'standalone'
  }),
});
