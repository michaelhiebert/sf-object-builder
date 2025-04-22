import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // 👈 needed for JSX
import path from "path";

export default defineConfig({
  plugins: [react()], // 👈 enable JSX support
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:8080",
      "/metadata": "http://localhost:8080",
      "/api": "http://localhost:8080", // Proxy API calls to Express
    },
  },
});
