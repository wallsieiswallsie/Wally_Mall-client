// Browser regression for the real live routes. API responses are isolated fixtures.
// Run against live-mode Vite dev/preview; PLAYWRIGHT_MODULE can point at a host runtime.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const baseURL = process.env.AUTH_BASE_URL || 'http://127.0.0.1:5173';
const apiBase = process.env.AUTH_API_BASE_URL || '/api/v1';
const browser = await chromium.launch({ headless: true,
  ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const calls = [], errors = [];
  let conflict = false;
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/api/v1/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.includes('/auth/')) calls.push({ url: request.url(), method: request.method(), body: request.postDataJSON() });
    if (path.endsWith('/auth/login') || (path.endsWith('/auth/register') && conflict)) {
      return route.fulfill({ status: conflict ? 409 : 401, json: { error: {
        code: conflict ? 'RESOURCE_CONFLICT' : 'INVALID_CREDENTIALS', request_id: 'auth-regression-reference',
      } } });
    }
    const data = path.endsWith('/auth/register') ? {
      access_token: 'fixture-access', refresh_token: 'fixture-refresh',
      user: { id: 'fixture-buyer', name: 'Test Buyer', roles: ['buyer'] },
    } : [];
    return route.fulfill({ status: path.endsWith('/auth/register') ? 201 : 200, json: { data } });
  });
  const heading = text => page.getByRole('heading', { name: text, exact: true }).waitFor({ timeout: 5000 });
  const body = { name: 'Test Buyer', email: 'buyer@example.test', password: 'Test-only-password-123!' };
  const fill = async register => {
    if (register) await page.getByRole('textbox', { name: 'Nama', exact: true }).fill(body.name);
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill(body.email);
    await page.getByLabel('Password', { exact: true }).fill(body.password);
  };
  await page.goto(`${baseURL}/register`);
  await heading('Daftar di Wally');
  assert.equal(await page.locator('input[name="name"]').count(), 1);
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('minlength'), '12');
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('maxlength'), '128');
  await page.reload();
  await heading('Daftar di Wally');
  assert.equal(new URL(page.url()).pathname, '/register');
  console.log('PASS A/G: direct /register and reload render registration');

  // Client navigation must also swap modes and clear the old form/error state.
  await page.getByRole('link', { name: 'Sudah punya akun? Masuk', exact: true }).click();
  await heading('Masuk ke Wally');
  assert.equal(await page.locator('input[name="name"]').count(), 0);
  await fill(false);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Email atau password tidak cocok.' }).waitFor();
  await page.getByText('Referensi: auth-regression-reference', { exact: true }).waitFor();
  assert.deepEqual(calls.at(-1), { url: new URL(`${apiBase}/auth/login`, baseURL).href,
    method: 'POST', body: { email: body.email, password: body.password } });
  await page.getByRole('link', { name: 'Buat akun baru', exact: true }).click();
  await heading('Daftar di Wally');
  assert.equal(await page.getByRole('alert').count(), 0);
  console.log('PASS: login mode, endpoint, payload, 401 message/reference and route switching');

  conflict = true;
  await fill(true);
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Data sudah terdaftar atau bertentangan dengan data lain.' }).waitFor();
  assert.deepEqual(calls.at(-1), { url: new URL(`${apiBase}/auth/register`, baseURL).href, method: 'POST', body });
  assert.equal(new URL(page.url()).pathname, '/register');
  console.log('PASS C UI: register conflict remains a 409 registration error');

  conflict = false;
  const before = calls.length;
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await page.waitForURL(`${baseURL}/`);
  assert.equal(calls.length, before + 1);
  assert.equal(calls.at(-1).url, new URL(`${apiBase}/auth/register`, baseURL).href);
  assert.equal(await page.evaluate(() => sessionStorage.getItem('wally-refresh-token')), 'fixture-refresh');
  assert.deepEqual(errors, []);
  console.log('PASS B UI/H URL: registration stores returned session without POST login; API base matches');
} finally {
  await browser.close();
}
