// Live React UI with explicit HTTP fixtures; native DB coverage lives in the server contract suite.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const base = 'http://127.0.0.1:5196';
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5196', '--strictPort'], {
  windowsHide: true, stdio: ['ignore', 'pipe', 'inherit'],
  env: { ...process.env, VITE_API_URL: base, VITE_PROTOTYPE_MODE: 'false', VITE_BUYER_URL: '', VITE_SELLER_URL: '', VITE_ADMIN_URL: '' },
});
let browser;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Vite timeout')), 30000);
    vite.stdout.on('data', d => { if (String(d).includes('Local:')) { clearTimeout(timer); resolve(); } });
    vite.once('error', reject);
  });
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(90000);
  const errors = [], calls = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    sessionStorage.setItem('wally-refresh-token', 'fixture-refresh');
    sessionStorage.removeItem('wally-payments:buyer');
  });
  const payment = { id: 'same-payment', status: 'pending', method: 'qris', provider: 'mock', amount: '10000', expires_at: '2099-01-01' };
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
    calls.push([route.request().method(), path]);
    let data;
    if (path === '/auth/refresh') data = { access_token: 'fixture', refresh_token: 'fixture-refresh' };
    else if (path === '/users/me') data = { id: 'buyer', name: 'Buyer', roles: ['buyer'] };
    else if (path === '/orders') data = [{ id: 'order', checkout_id: 'checkout', order_number: 'ORDER-TEST', status: 'awaiting_payment', payment }];
    else if (path === '/payments/same-payment') data = payment;
    else if (path === '/payments/same-payment/session') data = { id: payment.id, provider_reference: 'mock-same-payment' };
    else data = [];
    await route.fulfill({ json: { data } });
  });
  await page.goto(base + '/orders');
  await page.getByRole('link', { name: 'Lanjutkan pembayaran', exact: true }).click();
  await page.getByRole('button', { name: 'Buat / lanjutkan sesi pembayaran' }).click();
  await page.getByText('Referensi: mock-same-payment').waitFor();
  assert.ok(calls.some(([method, path]) => method === 'POST' && path === '/payments/same-payment/session'));
  assert.ok(!calls.some(([method, path]) => method === 'POST' && path === '/checkouts'));
  for (const status of ['expired', 'failed', 'success', 'refunded']) {
    payment.status = status;
    await page.reload();
    await page.getByRole('button', { name: 'Periksa status' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Buat / lanjutkan sesi pembayaran' }).count(), 0);
  }
  assert.deepEqual(errors, []);
  payment.provider = 'xendit';
  payment.status = 'pending';
  await page.route('**/api/v1/payments/same-payment/session', route => route.fulfill({ json: { data: {
    id: payment.id, status: 'pending', provider_reference: 'ps-fixture', checkout_url: 'https://xen.to/local-ui-fixture',
  } } }));
  await page.route('https://xen.to/local-ui-fixture', route => route.fulfill({ contentType: 'text/html', body: '<h1>Hosted checkout fixture</h1>' }));
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base + '/payment/same-payment');
    await page.getByRole('button', { name: 'Sinkronkan status Xendit' }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.getByRole('button', { name: 'Buat / lanjutkan sesi pembayaran' }).click();
    await page.getByRole('heading', { name: 'Hosted checkout fixture' }).waitFor();
    assert.equal(payment.status, 'pending');
    await page.goto(base + '/payment/same-payment?status=success');
    await page.getByRole('button', { name: 'Buat / lanjutkan sesi pembayaran' }).waitFor();
  }
  payment.reconciliation_required = true;
  await page.reload();
  await page.getByText(/Pembayaran sedang diperiksa/).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Buat / lanjutkan sesi pembayaran' }).count(), 0);
  assert.ok(!calls.some(([, path]) => /webhook/.test(path)));
  assert.deepEqual(errors, []);
  console.log('PASS Xendit hosted redirect and return-query distrust at 390/1280px (HTTP fixtures, not sandbox E2E)');
  console.log('PASS live UI fixture: storage-free payment recovery and terminal states');
} finally {
  await browser?.close();
  vite.kill();
  if (vite.exitCode === null && vite.signalCode === null) await once(vite, 'exit');
}
