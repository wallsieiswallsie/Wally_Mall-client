import test from 'node:test';
import assert from 'node:assert/strict';
import { configFromEnv, portalHref } from '../packages/api-client/config.js';

test('portal URLs are opt-in; login and account stay local and role paths are retained', () => {
  const empty = configFromEnv();
  for (const path of ['/seller/dashboard', '/admin/orders', '/super-admin/fee-rules', '/orders'])
    assert.equal(portalHref(path, empty, 'https://current.example'), path);
  const config = configFromEnv({ VITE_BUYER_URL: 'https://buyer.example', VITE_SELLER_URL: 'https://seller.example', VITE_ADMIN_URL: 'https://admin.example' });
  assert.equal(portalHref('/seller/orders/123?q=1#detail', config, 'https://buyer.example'), 'https://seller.example/seller/orders/123?q=1#detail');
  assert.equal(portalHref('/super-admin/fee-rules', config, 'https://buyer.example'), 'https://admin.example/super-admin/fee-rules');
  assert.equal(portalHref('/admin', config, 'https://admin.example'), '/admin');
  assert.equal(portalHref('/orders', config, 'https://seller.example'), 'https://buyer.example/orders');
  for (const path of ['/login', '/register', '/account', '../stores', -1]) assert.equal(portalHref(path, config), path);
});

test('central config retains the existing API variable and rejects malformed portal origins', () => {
  assert.equal(configFromEnv({VITE_API_URL:'https://api.example/'}).apiBaseUrl, 'https://api.example');
  assert.throws(() => configFromEnv({VITE_API_BASE_URL:'https://api.example'}), /obsolete/);
  for (const value of ['javascript:alert(1)', 'https://user:password@example.com', 'https://seller.example/path', ' https://seller.example'])
    assert.throws(() => configFromEnv({VITE_SELLER_URL:value}), /VITE_SELLER_URL/);
});
