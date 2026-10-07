// Optional browser QA: supply PLAYWRIGHT_MODULE when Playwright is provided by a host runtime.
// Run against the live-mode Vite server. All API traffic is isolated to local fixtures.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const baseURL = process.env.RESPONSIVE_BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.RESPONSIVE_OUTPUT || 'responsive-artifacts';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const context = await browser.newContext();
const page = await context.newPage();
const widths = [320, 360, 375, 390, 414, 480, 768, 1024, 1280, 1440, 1536, 1920];
let state = 'empty', roles = null;
const requests = [], errors = [], measurements = [];
page.on('pageerror', error => errors.push(error.message));
const products = Array.from({ length: 30 }, (_, i) => ({
  id: `product-${i}`, slug: `produk-${i}`, name: i === 1 ? 'ProdukSorongDenganNamaSangatPanjangTanpaSpasi'.repeat(3) : `Pilihan lokal Sorong ${i + 1}`,
  min_price: '125000', store_slug: 'toko-sorong', store_name: i === 2 ? 'TokoDenganNamaPanjangTanpaSpasi'.repeat(3) : 'Toko lokal Sorong',
  media: i % 2 ? [] : [{ media_type: 'image', url: `${baseURL}/qa-product.svg` }],
}));
const stores = [{ id: 'store-1', slug: 'toko-sorong', name: 'Toko lokal Sorong', description: 'Produk pilihan dari Sorong. '.repeat(5), location: { district: 'Sorong Manoi', city: 'Sorong' }, rating_count: 0 }];
await context.route('**/qa-product.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#e4e8df"/><circle cx="150" cy="150" r="70" fill="#80612d"/></svg>' }));
await context.route('**/api/v1/**', async route => {
  const url = new URL(route.request().url());
  requests.push({ path: url.pathname, query: Object.fromEntries(url.searchParams), method: route.request().method() });
  const user = { id: 'qa-user', name: 'Pengguna Sorong Dengan Nama Panjang', roles };
  let data = [];
  if (url.pathname.endsWith('/auth/refresh')) data = { user, access_token: 'qa-access', refresh_token: 'qa-refresh' };
  else if (url.pathname.endsWith('/users/me')) data = user;
  else if (url.pathname.endsWith('/categories')) data = [{ id: 'category-1', slug: 'lokal', name: 'Pilihan lokal' }];
  else if (url.pathname.endsWith('/stores')) data = state === 'empty' ? [] : stores;
  else if (/\/(search|products|favorites)$/.test(url.pathname)) {
    if (state === 'loading') await new Promise(resolve => setTimeout(resolve, 1200));
    if (state === 'error') {
      return route.fulfill({ status: 500, json: { error: { code: 'HTTP_500', request_id: 'qa-error' } } });
    }
    data = state === 'empty' ? [] : url.searchParams.get('type') === 'store' ? stores : Number(url.searchParams.get('offset')) > 0 ? products.slice(0, 3) : products;
  }
  await route.fulfill({ json: { data } }).catch(() => {});
});
async function visit(path = '/explore') {
  await page.goto(baseURL + path);
  await page.locator('.live-shell').waitFor();
}
async function settled() {
  await page.locator('.live-results[aria-busy="false"]').waitFor();
}
async function catalogAction(action) {
  const response = page.waitForResponse(r => new URL(r.url()).pathname.endsWith('/search'));
  await action();
  await response;
  await settled();
}
async function checkLayout(label, width) {
  const result = await page.evaluate(() => {
    const bounds = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right }; };
    const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
    const main = document.querySelector('main');
    const form = document.querySelector('.live-search');
    const nav = document.querySelector('.bottom-nav');
    return {
      viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      main: bounds(main), footer: bounds(document.querySelector('footer')),
      gutter: parseFloat(getComputedStyle(main).paddingLeft),
      nav: visible(nav) ? bounds(nav) : null,
      controls: form ? [...form.children].map(bounds) : [],
      gridColumns: document.querySelector('.product-grid') ? getComputedStyle(document.querySelector('.product-grid')).gridTemplateColumns : null,
      overflowing: [...document.querySelectorAll('main *, header *, footer *')].filter(el => visible(el) && bounds(el).right > innerWidth + 1).slice(0, 8).map(el => `${el.tagName}.${el.className}`),
    };
  });
  assert.ok(result.scrollWidth <= width, `${label} ${width}: horizontal overflow ${JSON.stringify(result)}`);
  assert.ok(result.main.width <= 1256, `${label}: container exceeds design width`);
  assert.equal(result.gutter, width < 375 ? 16 : width < 768 ? 20 : 28, `${label}: aligned container gutters`);
  assert.ok(result.footer.y >= result.main.bottom - 1, `${label}: footer overlaps main`);
  assert.ok(result.controls.every(c => c.height >= 44 && c.width > 0), `${label}: control touch targets`);
  if (width >= 768 && result.controls.length) assert.ok(result.controls.every(c => Math.abs(c.y - result.controls[0].y) < 1), `${label}: controls must share row`);
  if (width < 768 && result.controls.length) assert.ok(result.controls[1].y > result.controls[0].y, `${label}: mobile controls must stack`);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  if (width < 768) {
    const clear = await page.evaluate(() => document.querySelector('footer').getBoundingClientRect().bottom <= document.querySelector('.bottom-nav').getBoundingClientRect().top + 1);
    assert.ok(clear, `${label}: bottom nav obscures footer`);
  }
  measurements.push({ label, width, ...result });
  await page.evaluate(() => window.scrollTo(0, 0));
}
try {
  for (const variant of ['empty', 'products', 'stores']) {
    state = variant;
    await visit(variant === 'stores' ? '/search?tab=toko' : '/explore');
    await settled();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await checkLayout(variant, width);
      if ([320, 390, 768, 1440, 1920].includes(width) && variant !== 'stores') await page.screenshot({ path: `${output}/${variant}-${width}.png`, fullPage: variant === 'empty' });
    }
    if (variant === 'empty') {
      assert.equal(await page.getByRole('button', { name: 'Sebelumnya' }).isDisabled(), true);
      assert.equal(await page.getByRole('button', { name: 'Selanjutnya' }).isDisabled(), true);
    }
  }
  state = 'products';
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(); await settled();
  assert.equal(await page.locator('.bottom-nav [aria-current="page"]').innerText(), 'Cari');
  await page.getByRole('textbox', { name: 'Cari produk' }).fill('kopi Sorong');
  await page.getByRole('combobox', { name: 'Urutan' }).selectOption('price_asc');
  await catalogAction(() => page.getByRole('button', { name: 'Cari', exact: true }).click());
  assert.ok(requests.some(r => r.query.q === 'kopi Sorong' && r.query.sort === 'price_asc' && r.query.limit === '30' && r.query.offset === '0' && r.query.type === 'product'));
  await catalogAction(() => page.getByRole('button', { name: 'Selanjutnya' }).click());
  assert.equal(new URL(page.url()).searchParams.get('offset'), '30');
  assert.equal(await page.getByRole('button', { name: 'Selanjutnya' }).isDisabled(), true);
  await catalogAction(() => page.getByRole('button', { name: 'Sebelumnya' }).click());
  assert.equal(new URL(page.url()).searchParams.get('offset'), '0');
  await page.getByRole('combobox', { name: 'Jenis pencarian' }).selectOption('toko');
  await catalogAction(() => page.getByRole('button', { name: 'Cari', exact: true }).click());
  assert.ok(requests.some(r => r.query.type === 'store' && r.query.q === 'kopi Sorong'));
  await page.screenshot({ path: `${output}/stores-390.png`, fullPage: true });
  state = 'loading'; await visit();
  await page.getByRole('status').waitFor();
  await page.screenshot({ path: `${output}/loading-390.png` }); await settled();
  state = 'error'; await visit();
  await page.getByRole('alert').waitFor();
  await page.screenshot({ path: `${output}/error-390.png` });
  state = 'products';
  await catalogAction(() => page.getByRole('button', { name: 'Coba lagi' }).click());
  assert.equal(await page.locator('.product-card').count(), 30);
  state = 'products';
  for (const role of ['buyer', 'seller', 'admin', 'super_admin']) {
    roles = [role];
    await page.evaluate(() => sessionStorage.setItem('wally-refresh-token', 'qa-refresh'));
    await visit(); await settled();
    for (const width of [320, 768, 1024, 1151, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await checkLayout(role, width);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await dialog.getByRole('link', { name: 'Buka lapak' }).count(), 1);
    assert.equal(await dialog.getByRole('link', { name: 'Keranjang' }).count(), role === 'buyer' ? 1 : 0);
    assert.equal(await dialog.getByRole('link', { name: 'Dashboard' }).count(), role === 'buyer' ? 0 : 1);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(el => document.activeElement === el), true);
  }
  roles = ['buyer']; await visit('/favorites'); await settled();
  await checkLayout('favorites', 390);
  await visit('/category/lokal'); await settled();
  await checkLayout('category', 390);
  assert.ok(requests.some(r => r.query.category_id === 'category-1'));
  await page.evaluate(() => sessionStorage.clear()); roles = null;
  for (const path of ['/', '/categories', '/login', '/register']) {
    await visit(path);
    for (const width of [320, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await checkLayout(path, width);
    }
  }
  assert.deepEqual(errors, []);
  await writeFile(`${output}/measurements.json`, JSON.stringify(measurements, null, 2));
  console.log(`PASS ${measurements.length} responsive route/state/width checks; search, pagination, retry, role links, dialog Escape/focus, no browser exceptions.`);
} finally {
  await browser.close();
}
