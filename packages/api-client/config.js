import { normalizeApiOrigin } from './url.js';

function portalOrigin(value, key) {
  if (!value) return '';
  try { return normalizeApiOrigin(value); }
  catch { throw new Error(`${key} must be an absolute HTTP(S) origin without a path, query or credentials.`); }
}

export function configFromEnv(env = {}) {
  if (env.VITE_API_BASE_URL)
    throw new Error('VITE_API_BASE_URL is obsolete. Use VITE_API_URL (server origin only).');
  return Object.freeze({
    apiBaseUrl: normalizeApiOrigin(env.VITE_API_URL),
    prototypeMode: env.VITE_PROTOTYPE_MODE === 'true',
    buyerUrl: portalOrigin(env.VITE_BUYER_URL, 'VITE_BUYER_URL'),
    sellerUrl: portalOrigin(env.VITE_SELLER_URL, 'VITE_SELLER_URL'),
    adminUrl: portalOrigin(env.VITE_ADMIN_URL, 'VITE_ADMIN_URL'),
    courierUrl: portalOrigin(env.VITE_COURIER_URL, 'VITE_COURIER_URL'),
  });
}

export const config = configFromEnv(import.meta.env);

// Auth/account routes stay on the current origin. Credentials never travel in URLs.
export function portalHref(to, settings = config, currentOrigin = globalThis.location?.origin) {
  if (typeof to !== 'string' || !to.startsWith('/') || to.startsWith('//')) return to;
  const pathname = to.split(/[?#]/)[0];
  if (/^\/(login|register|account)(\/|$)/.test(pathname)) return to;
  const portal = /^\/(admin|super-admin)(\/|$)/.test(pathname) ? 'admin'
    : /^\/seller(\/|$)/.test(pathname) ? 'seller'
    : /^\/courier(\/|$)/.test(pathname) ? 'courier' : 'buyer';
  const origin = settings[`${portal}Url`];
  return origin && origin !== currentOrigin ? `${origin}${to}` : to;
}
