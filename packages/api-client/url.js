export const API_PREFIX = "/api/v1";

export function normalizeApiOrigin(value, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new Error("VITE_API_URL is required for production builds and must contain only the server origin.");
    return ""; // Vite's local /api proxy serves same-origin development requests.
  }
  if (typeof value !== "string" || value !== value.trim())
    throw new Error("VITE_API_URL must contain only the server origin (no path, query, or fragment).");
  let parsed;
  try { parsed = new URL(value); } catch {
    throw new Error("VITE_API_URL must be an absolute HTTP(S) server origin.");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password ||
      parsed.pathname !== "/" || parsed.search || parsed.hash)
    throw new Error("VITE_API_URL must contain only the server origin and must not include /api/v1 or /v1.");
  return parsed.origin;
}

export function apiUrl(path, origin = "") {
  const base = normalizeApiOrigin(origin);
  if (typeof path !== "string" || !/^\/[A-Za-z0-9]/.test(path) ||
      path.startsWith("//") || /^\/(?:api\/)?v\d+(?:\/|\?|$)/.test(path) ||
      path.includes("#") || path.includes("\\"))
    throw new Error("API request path must be a relative endpoint beginning with / and without an API version prefix.");
  return `${base}${API_PREFIX}${path}`;
}
