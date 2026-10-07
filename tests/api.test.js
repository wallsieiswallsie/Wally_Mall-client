import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../src/api/client.js';
import { findSellerOrder } from '../src/api/orders.js';
const ok = data => new Response(JSON.stringify({ data }), { status: 200 });
const fail = (status = 401, code = 'UNAUTHORIZED') => new Response(JSON.stringify({ error: { code, request_id: 'request-test' } }), { status });
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const credentials = { access_token: 'access-one', refresh_token: 'refresh-one', expires_in: 900, user: { id: 'user-one', roles: ['buyer'] } };

test('public requests omit auth; login serializes JSON and private requests inject bearer', async () => {
  const calls = [], saved = storage();
  const api = createApi({ baseUrl: 'http://server.test/api/v1/', storage: saved, fetchImpl: async (url, options) => { calls.push({ url, ...options }); return ok(url.endsWith('/auth/login') ? credentials : []); } });
  await api.request('/products', { auth: false });
  assert.equal(calls[0].url, 'http://server.test/api/v1/products');
  assert.equal(calls[0].headers.Authorization, undefined);
  const body = { email: 'buyer@example.test', password: 'a-long-password' };
  assert.deepEqual(await api.authenticate(false, body), credentials.user);
  assert.deepEqual(JSON.parse(calls[1].body), body);
  await api.request('/cart');
  assert.equal(calls[2].headers.Authorization, 'Bearer access-one');
  assert.equal(saved.getItem('wally-refresh-token'), 'refresh-one');
});

test('concurrent 401s share one refresh, retry once, and store rotated token', async () => {
  let refreshes = 0, privateCalls = 0;
  const saved = storage();
  const api = createApi({ storage: saved, fetchImpl: async (url, options) => {
    if (url.endsWith('/auth/login')) return ok(credentials);
    if (url.endsWith('/auth/refresh')) {
      refreshes++;
      assert.deepEqual(JSON.parse(options.body), { refresh_token: 'refresh-one' });
      await new Promise(resolve => setTimeout(resolve, 5));
      return ok({ access_token: 'access-two', refresh_token: 'refresh-two', expires_in: 900 });
    }
    privateCalls++;
    return options.headers.Authorization === 'Bearer access-one' ? fail() : ok({ value: url });
  } });
  await api.authenticate(false, {});
  const results = await Promise.all([api.request('/cart'), api.request('/orders'), api.request('/addresses')]);
  assert.equal(results.length, 3);
  assert.equal(refreshes, 1);
  assert.equal(privateCalls, 6);
  assert.equal(saved.getItem('wally-refresh-token'), 'refresh-two');
});

test('failed refresh clears session; a repeated 401 cannot cause an infinite loop', async () => {
  for (const rejectRefresh of [true, false]) {
    let refreshes = 0, ended = 0;
    const saved = storage();
    const api = createApi({ storage: saved, onUnauthorized: () => ended++, fetchImpl: async url => {
      if (url.endsWith('/auth/login')) return ok(credentials);
      if (url.endsWith('/auth/refresh')) { refreshes++; return rejectRefresh ? fail() : ok({ ...credentials, access_token: 'access-two', refresh_token: 'refresh-two' }); }
      return fail();
    } });
    await api.authenticate(false, {});
    await assert.rejects(api.request('/users/me'), { status: 401 });
    assert.equal(refreshes, 1); assert.equal(ended, 1);
    assert.equal(saved.getItem('wally-refresh-token'), undefined);
  }
});

test('reload restores user through rotating refresh and users/me; logout revokes and clears', async () => {
  const saved = storage(); saved.setItem('wally-refresh-token', 'refresh-one');
  const calls = [];
  const api = createApi({ storage: saved, fetchImpl: async (url, options) => { calls.push(url); return ok(url.endsWith('/auth/refresh') ? credentials : url.endsWith('/users/me') ? credentials.user : { revoked: true }); } });
  assert.deepEqual(await api.restore(), credentials.user);
  await api.logout();
  assert.deepEqual(calls, ['/api/v1/auth/refresh', '/api/v1/users/me', '/api/v1/auth/logout']);
  assert.equal(saved.getItem('wally-refresh-token'), undefined);
  assert.equal(await api.restore(), null);
});

test('403 permission and network errors do not refresh or erase a valid session', async () => {
  let mode = 'permission', refreshes = 0;
  const saved = storage();
  const api = createApi({ storage: saved, fetchImpl: async url => {
    if (url.endsWith('/auth/login')) return ok(credentials);
    if (url.endsWith('/auth/refresh')) refreshes++;
    if (mode === 'network') throw new TypeError('offline');
    return fail(403, 'FORBIDDEN');
  } });
  await api.authenticate(false, {});
  await assert.rejects(api.request('/admin/orders'), { status: 403, requestId: 'request-test' });
  mode = 'network'; await assert.rejects(api.request('/cart'), /Server tidak dapat dihubungi/);
  assert.equal(refreshes, 0); assert.equal(saved.getItem('wally-refresh-token'), 'refresh-one');
});

test('abort and invalid response are reported; unavailable browser storage does not break login', async () => {
  let mode = 'login';
  const api = createApi({ storage: { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }, fetchImpl: async () => {
    if (mode === 'abort') throw new DOMException('Aborted', 'AbortError');
    if (mode === 'invalid') return new Response('<html>wrong proxy</html>');
    return ok(credentials);
  } });
  assert.deepEqual(await api.authenticate(false, {}), credentials.user);
  mode = 'abort'; await assert.rejects(api.request('/products', { auth: false }), { name: 'AbortError' });
  mode = 'invalid'; await assert.rejects(api.request('/products', { auth: false }), { code: 'INVALID_API_RESPONSE' });
});

test('late responses from a previous login never retry as the new user', async () => {
  let finishOldRequest;
  let privateCalls = 0, logins = 0;
  const api = createApi({ fetchImpl: async url => {
    if (url.endsWith('/auth/login')) return ok({ ...credentials, access_token: `access-${++logins}` });
    privateCalls++;
    return new Promise(resolve => { finishOldRequest = resolve; });
  } });
  await api.authenticate(false, {});
  const pending = api.request('/cart');
  await api.authenticate(false, {});
  finishOldRequest(fail());
  await assert.rejects(pending, { status: 401 });
  assert.equal(privateCalls, 1);
});

test('seller deep links find orders beyond the first API page and handle missing IDs', async () => {
  const calls = [];
  const api = { request: async path => {
    calls.push(path);
    return path.endsWith('offset=0') ? Array.from({ length: 100 }, (_, i) => ({ id: `order-${i}` })) : [{ id: 'older-order', status: 'ready' }];
  } };
  assert.equal((await findSellerOrder(api, 'older-order')).status, 'ready');
  assert.deepEqual(calls, ['/seller/orders?limit=100&offset=0', '/seller/orders?limit=100&offset=100']);
  await assert.rejects(findSellerOrder(api, 'missing'), /Pesanan tidak ditemukan/);
});
