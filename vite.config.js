import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Keeps chunk sizes reasonable — no warnings on build
    chunkSizeWarningLimit: 800,
  },
});
