import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { apiDevPlugin } from './vite-plugin-api';

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()],
  server: {
    port: 5173,
  },
});
