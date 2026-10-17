import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('production static server serves assets and SPA deep links but never substitutes HTML for API paths', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'wally-static-test-'));
  await mkdir(path.join(root, 'dist'));
  await writeFile(path.join(root, 'dist/index.html'), '<!doctype html><h1>fixture</h1>');
  await writeFile(path.join(root, 'dist/app.js'), 'export const fixture = true;');
  const child = spawn(process.execPath, [fileURLToPath(new URL('../scripts/serve.mjs', import.meta.url))], { cwd: root, env: { ...process.env, PORT: '0', HOST: '127.0.0.1' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    const port = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Static server startup timeout')), 10000);
      child.stdout.on('data', data => { const match = String(data).match(/listening on (\d+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
      child.once('error', e => { clearTimeout(timer); reject(e); });
      child.once('exit', code => { clearTimeout(timer); reject(new Error(`Static server exited ${code}`)); });
    });
    const url = `http://127.0.0.1:${port}`;
    for (const route of ['/', '/seller/orders/123', '/super-admin/fee-rules']) {
      const response = await fetch(url + route);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
    }
    assert.match((await fetch(url + '/app.js')).headers.get('content-type'), /javascript/);
    for (const route of ['/missing.js', '/api/v1/products']) assert.equal((await fetch(url + route)).status, 404);
    assert.equal((await fetch(url, { method: 'POST' })).status, 405);
    assert.equal(await (await fetch(url, { method: 'HEAD' })).text(), '');
  } finally {
    child.kill();
    if (child.exitCode === null && child.signalCode === null) await once(child, 'exit');
    // The directory is created above under tmpdir and contains only this test's fixtures.
    assert.equal(path.dirname(root), tmpdir());
    assert.ok(path.basename(root).startsWith('wally-static-test-'));
    await rm(root, { recursive: true, force: true });
  }
});
