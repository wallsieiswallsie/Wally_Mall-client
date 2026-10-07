export function browserStorage() {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}
// A checkout response is the only buyer API that exposes its payment UUID.
// Cache only this navigation hint; payment ownership/status is always rechecked by the API.
export function paymentLinks(userId, checkout) {
  const storage = browserStorage(),
    key = `wally-payments:${userId}`;
  try {
    const value = JSON.parse(storage?.getItem(key) || "{}");
    const links =
      value && typeof value === "object" && !Array.isArray(value) ? value : {};
    if (checkout) {
      links[checkout.id] = checkout.payment.id;
      storage?.setItem(key, JSON.stringify(links));
    }
    return links;
  } catch {
    return {};
  }
}
