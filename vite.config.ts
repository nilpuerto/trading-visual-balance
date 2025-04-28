import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/TradingApp/', // Cambiado para coincidir con el nombre del repositorio
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: 'dist', // Carpeta de salida
    assetsDir: 'assets', // Carpeta para los archivos generados
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]', // Asegura que los archivos CSS/JS estén en "assets"
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));