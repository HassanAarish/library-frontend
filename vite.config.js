import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // Never cache API calls or book pages offline.
        navigateFallbackDenylist: [/^\/api/],
      },
      manifest: {
        name: "LibraryHub",
        short_name: "LibraryHub",
        description: "Rent and read books online.",
        start_url: "/",
        display: "standalone",
        background_color: "#fbf8f3",
        theme_color: "#1f5c4a",
        icons: [
          { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name].[hash].js`,
        chunkFileNames: `[name].[hash].js`,
        assetFileNames: `[name].[hash].[ext]`,
      },
    },
    chunkSizeWarningLimit: 1500,
  },
  server: {
    headers: {
      "Cache-Control": "no-cache",
    },
  },
});
