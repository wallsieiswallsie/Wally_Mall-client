// Isolated live-route browser regression. No GCS credentials or real API writes.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : "playwright");
const cwd = fileURLToPath(new URL("..", import.meta.url));
const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5184"], {
  cwd, windowsHide: true, stdio: "ignore",
  env: { ...process.env, VITE_API_URL: "http://127.0.0.1:5184", VITE_API_BASE_URL: "", VITE_PROTOTYPE_MODE: "false" },
});
let browser, page;
try {
  const base = "http://127.0.0.1:5184";
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (await fetch(base).then((r) => r.ok).catch(() => false)) { ready = true; break; }
    if (vite.exitCode !== null) throw new Error("Vite exited before startup");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, "Vite must start");
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => sessionStorage.setItem("wally-refresh-token", "fixture-refresh"));
  page = await context.newPage();
  const errors = [], deleted = [];
  let next = 0, created;
  const uploaded = new Set();
  page.on("pageerror", (error) => { errors.push(error.message); console.error(error.message); });
  await context.route("**/__test_upload/*", async (route) => {
    const id = new URL(route.request().url()).pathname.split("/").at(-1);
    if (id === "1") return route.fulfill({ status: 500, body: "retry test" });
    assert.equal(route.request().method(), "PUT");
    assert.equal(route.request().headers()["content-type"], "image/png");
    uploaded.add(id);
    return route.fulfill({ status: 200, body: "" });
  });
  await context.route("**/api/v1/**", async (route) => {
    const req = route.request(), path = new URL(req.url()).pathname.replace("/api/v1", "");
    let data = [];
    if (path === "/auth/refresh") data = { access_token: "fixture-access", refresh_token: "fixture-refresh" };
    else if (path === "/users/me") data = { id: "seller", name: "Seller", roles: ["seller"] };
    else if (path === "/seller/stores") data = [{ id: "store", name: "Test Store" }];
    else if (path === "/categories") data = [{ id: "category", name: "Test Category" }];
    else if (path === "/media/uploads") {
      const body = req.postDataJSON();
      assert.equal(body.purpose, "product");
      assert.equal(body.content_type, "image/png");
      const id = String(++next);
      data = { upload_id: id, upload_url: `${base}/__test_upload/${id}`, headers: { "Content-Type": "image/png", "x-goog-if-generation-match": "0" } };
    } else if (/^\/media\/uploads\/\d+\/complete$/.test(path)) {
      const id = path.split("/")[3];
      assert.ok(uploaded.has(id), "complete only after PUT");
      data = { id, public_url: `https://storage.googleapis.com/wallymall-media-prod/products/seller/${id}.png` };
    } else if (/^\/media\/\d+$/.test(path) && req.method() === "DELETE") {
      deleted.push(path.split("/").at(-1)); data = { deleted: true };
    } else if (path === "/seller/stores/store/products" && req.method() === "POST") {
      created = req.postDataJSON(); data = { id: "product", slug: "product" };
    }
    await route.fulfill({ json: { data } });
  });
  await page.goto(`${base}/seller/products/new`);
  await page.getByRole("heading", { name: "Tambah produk" }).waitFor();
  assert.equal(await page.locator('input[name="image_url"]').count(), 0);
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhAAAAABJRU5ErkJggg==", "base64");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.png", mimeType: "image/png", buffer: png },
    { name: "second.png", mimeType: "image/png", buffer: png },
  ]);
  await page.getByRole("button", { name: "Coba lagi", exact: true }).waitFor();
  await page.getByText("Upload berhasil ✓", { exact: true }).waitFor();
  assert.ok(await page.getByRole("button", { name: "Simpan", exact: true }).isDisabled());
  const second = page.locator(".media-previews > div").filter({ hasText: "second.png" });
  await second.getByRole("button", { name: "Hapus" }).click();
  await second.waitFor({ state: "detached" });
  await page.getByRole("button", { name: "Coba lagi", exact: true }).click();
  await page.getByText("Upload berhasil ✓", { exact: true }).waitFor();
  for (const [name, value] of Object.entries({ name: "Test product", description: "Description", variant_name: "Default", price: "1000", on_hand: "1" }))
    await page.locator(`input[name="${name}"]`).fill(value);
  assert.equal(await page.locator(".media-previews img").count(), 1);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "mobile form should not overflow");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await page.waitForURL("**/seller/dashboard");
  assert.deepEqual(created.media, [{ media_asset_id: "3" }]);
  assert.deepEqual(deleted.sort(), ["1", "2"]);
  assert.deepEqual(errors, []);
  console.log("PASS live seller mobile uploader: previews, multiple files, failure, retry, removal, disabled submit, asset-only creation");
} catch (error) {
  if (page) console.error("Browser failure:", page.url(), await page.locator("body").innerText().catch(() => "No document"));
  throw error;
} finally {
  await browser?.close();
  vite.kill();
}
