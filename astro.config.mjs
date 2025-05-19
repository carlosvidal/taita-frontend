// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://demo.taita.blog',
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  experimental: {
    session: true
  },
  // Configuración de la API base
  server: {
    host: true,
    port: 4321
  },
  vite: {
    define: {
      'process.env': process.env
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://taita-api.onrender.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
});
