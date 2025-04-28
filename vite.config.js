import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss()], 
  server: {
    port: 5000,
  },
  build: {
    target: 'esnext',
  },
});
