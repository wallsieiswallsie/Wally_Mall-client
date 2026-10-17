// Demo credentials only. Replace this adapter with a server-issued session in production.
// A production role must come from the authenticated server, never an email pattern or selector.
const accounts = {
  'buyer@demo.wally': 'buyer',
  'seller@demo.wally': 'seller',
  'admin@demo.wally': 'admin',
  'super@demo.wally': 'super_admin',
};
export function authenticateDemo(identity, password, enabled) {
  if (!enabled) throw new Error('Prototype Access dinonaktifkan.');
  const role = accounts[String(identity).trim().toLowerCase()];
  if (!role || password !== 'wally-demo') throw new Error('Akun demo tidak cocok. Gunakan buyer@demo.wally, seller@demo.wally, admin@demo.wally, atau super@demo.wally dengan password wally-demo.');
  return role;
}
