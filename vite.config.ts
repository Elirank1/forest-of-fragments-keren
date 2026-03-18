import { defineConfig } from 'vite';

export default defineConfig({
  base: '/forest-of-fragments-keren/',
  server: {
    host: true,
    port: 5173
  },
  build: {
    sourcemap: true
  }
});
