// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://demo.taita.blog',
  output: 'static',
  base: '/',
  experimental: {
    session: true
  },
  // Configuración del servidor para desarrollo local
  server: {
    host: true,
    port: 4321,
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    }
  },
  // Configuración de la API base
  publicDir: './public',
  // Configuración de Vite
  vite: {
    define: {
      'process.env': {
        ...process.env,
        PUBLIC_API_URL: JSON.stringify(process.env.PUBLIC_API_URL || 'https://taita-api.onrender.com/api'),
        PUBLIC_IMAGE_BASE_URL: JSON.stringify(process.env.PUBLIC_IMAGE_BASE_URL || 'https://taita-api.onrender.com')
      }
    },
    // Configuración para producción
    build: {
      target: 'esnext',
      minify: 'esbuild',
      emptyOutDir: true,
      // Configuración adicional para el manejo de rutas
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    // Configuración del servidor de desarrollo
    server: {
      headers: {
        'Cache-Control': 'no-cache, no-store',
      },
    },
  },
  // Configuración de redirecciones
  redirects: {
    // Redirigir todas las rutas no encontradas al index.html
    '/**': '/index.html',
  },
});
