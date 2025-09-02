import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Fix for "process is not defined" error
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    // Pre-bundle dependencies for better performance
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "zustand",
      "immer",
      "@tanstack/react-query",
      "schema",
    ],
    // Ensure linked/workspace deps are pre-bundled
    force: true,
  },
  ssr: {
    // Ensure workspace package is bundled (not externalized) in SSR contexts
    noExternal: ["schema"],
  },
  build: {
    // Optimize build for production
    // Force Rollup CJS transform for workspace package paths (in local & Docker)
    commonjsOptions: {
      include: [
        /node_modules/,
        /packages[\\\/]schema[\\\/]dist[\\\/].*/,
        /packages[\\\/]schema[\\\/].*/,
        /app[\\\/]packages[\\\/]schema[\\\/]dist[\\\/].*/,
      ],
      transformMixedEsModules: true,
      requireReturnsDefault: "auto",
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          state: ["zustand", "immer"],
          query: ["@tanstack/react-query"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-toast",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],
        },
      },
    },
  },
}));
