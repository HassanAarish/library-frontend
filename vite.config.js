import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import process from "node:process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fills __SITE_URL__ in index.html (absolute og:image for link previews) and
 * writes robots.txt: private screens are disallowed and crawlers are pointed at
 * the API's sitemap of public pages and books.
 */
const seoFiles = (env) => {
  // A placeholder/malformed value leaves og:image relative rather than broken.
  const site = URL.canParse(env.VITE_SITE_URL ?? "") ? env.VITE_SITE_URL.replace(/\/+$/, "") : "";
  const api = (env.VITE_API_URL || "").replace(/\/+$/, "");
  return {
    name: "libraryhub-seo",
    transformIndexHtml: (html) => html.replaceAll("__SITE_URL__", site),
    generateBundle() {
      const lines = [
        "User-agent: *",
        ...["/account", "/admin", "/read/", "/login", "/signup", "/dev/"].map(
          (p) => `Disallow: ${p}`,
        ),
        "",
        ...(/^https?:\/\//.test(api) ? [`Sitemap: ${api}/seo/sitemap.xml`] : []),
      ];
      this.emitFile({ type: "asset", fileName: "robots.txt", source: `${lines.join("\n")}\n` });
    },
  };
};

export default defineConfig(({ mode }) => ({
  plugins: [
    seoFiles(loadEnv(mode, process.cwd(), "VITE_")),
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
  // npm test: unit/component tests (Vitest + Testing Library) in jsdom.
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
    css: false,
  },
}));
