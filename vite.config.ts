import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: process.env.NODE_ENV === 'production' ? 'localhost' : '0.0.0.0',
    strictPort: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'], // Split core libs
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react'], // Split UI libs
        }
      }
    }
  }
});
