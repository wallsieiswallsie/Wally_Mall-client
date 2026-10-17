export function browserStorage() {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}
