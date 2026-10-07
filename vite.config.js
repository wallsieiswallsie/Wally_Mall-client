import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { normalizeApiOrigin } from "./src/api/url.js";
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.VITE_API_BASE_URL)
    throw new Error("VITE_API_BASE_URL is obsolete. Set VITE_API_URL to the server origin only (without /api/v1).");
  normalizeApiOrigin(env.VITE_API_URL, { required: command === "build" });
  const proxy = {
    "/api": {
      target: env.API_PROXY_TARGET || "http://127.0.0.1:3001",
      changeOrigin: true,
    },
  };
  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, strictPort: true, proxy },
  };
});
