import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VENDOR_PUBLIC': JSON.stringify(env.VENDOR_PUBLIC),
      'process.env.CLIENT_SECRET': JSON.stringify(env.CLIENT_SECRET),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core — cambia raramente, se cachea por mucho tiempo
            'vendor-react': ['react', 'react-dom'],

            // Firebase — librería grande, separada del resto
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],

            // UI y animaciones
            'vendor-ui': ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'],

            // PDF — solo se carga cuando se genera una factura
            'vendor-pdf': ['jspdf', 'jspdf-autotable'],

            // Router
            'vendor-router': ['wouter'],
          },
        },
      },
    },
  };
});