import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { configFromEnv } from '../packages/api-client/config.js';
import { normalizeApiOrigin } from '../packages/api-client/url.js';

const clientRoot = fileURLToPath(new URL('../', import.meta.url));
export function portalVite(portal) {
  const root = portal ? fileURLToPath(new URL(`../apps/${portal}/`, import.meta.url)) : clientRoot;
  const offset = { buyer: 0, seller: 1, admin: 2 }[portal] || 0;
  return defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, clientRoot, '');
    configFromEnv(env);
    normalizeApiOrigin(env.VITE_API_URL, { required: command === 'build' });
    const proxy = { '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:3001', changeOrigin: true } };
    return {
      root,
      envDir: clientRoot,
      plugins: [react(), tailwindcss()],
      server: { port: 5173 + offset, strictPort: true, proxy, fs: { allow: [clientRoot] } },
      preview: { port: 4173 + offset, strictPort: true, proxy },
    };
  });
}
