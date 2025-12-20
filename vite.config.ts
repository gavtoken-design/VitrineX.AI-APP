import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Detecta o modo de build via variável de ambiente
const buildMode = process.env.BUILD_MODE || 'standalone';

export default defineConfig({
  base: './',
  server: {
    port: 8080,
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        // Entry point baseado no modo de build
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react'],
        }
      }
    }
  },
  // Define variável global para identificar o modo
  define: {
    __BUILD_MODE__: JSON.stringify(buildMode),
  }
});
