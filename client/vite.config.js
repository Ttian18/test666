import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Get backend URL from environment or default to localhost
const BACKEND_URL = process.env.VITE_BACKEND_URL || "http://localhost:5001";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "0.0.0.0", // Bind to all network interfaces for better network access
    proxy: {
      "/api/recommendations": {
        target: BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/recommendations/, "/restaurants"),
      },
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
