import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// Detecta o modo de build via variável de ambiente
const buildMode = process.env.BUILD_MODE || 'standalone';

export default defineConfig({
  base: './',
  server: {
    port: 8080,
    host: process.env.NODE_ENV === 'production' ? 'localhost' : '0.0.0.0',
    strictPort: true,
    open: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      manifest: false
    }),
    // Compressão Gzip
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Compressão Brotli (melhor que gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/utils': path.resolve(__dirname, './src/lib'),
    }
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 500, // Reduzido de 1000 para 500
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Removido manualChunks customizado - causa problemas de ordem de carregamento
        // Deixando Vite/Rollup fazer o splitting automaticamente
        // Nomes de arquivo com hash para cache
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      }
    },
    // Otimizações adicionais
    cssCodeSplit: true,
    sourcemap: true, // Habilitar sourcemaps para debug
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
    ],
    exclude: [
      '@canva/app-ui-kit', // Apenas se não estiver usando
    ]
  },
  // Define variável global para identificar o modo
  define: {
    __BUILD_MODE__: JSON.stringify(buildMode),
  }
});
