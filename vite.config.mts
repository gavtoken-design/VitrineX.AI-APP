import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Detecta o modo de build via variável de ambiente
const buildMode = process.env.BUILD_MODE || 'standalone';

export default defineConfig({
  base: './',
  server: {
    port: 8080,
    host: process.env.NODE_ENV === 'production' ? 'localhost' : '0.0.0.0',
    strictPort: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        cleanupOutdatedCaches: true
      },
      manifest: false // Use existing manifest.json in public or generated one? If public has it, use false or configure to copy? Vite copies public.
      // Actually, if I set manifest: false, it won't generate one, but it will generate sw.js.
      // But typically we want the plugin to manage the manifest if we want injection.
      // Let's set injectRegister: 'auto' (default).
    })
  ],
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
