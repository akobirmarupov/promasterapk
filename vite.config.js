import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In the browser (npm run dev) /api and /media go to the local Promaster site; in the app — to promaster.com.uz.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/media": "http://127.0.0.1:8000",
    },
  },
  build: { target: "es2019", chunkSizeWarningLimit: 1500 },
});
