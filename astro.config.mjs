// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // No necesitamos un adaptador para sitios estáticos
  // No necesitamos la bandera experimental de sesiones para sitios estáticos
});
