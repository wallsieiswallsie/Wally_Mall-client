import { spawn } from 'node:child_process';
import { once } from 'node:events';

// Local-only fixture runner: never reads production API addresses into the browser.
const port = 5187;
const env = { ...process.env, VITE_API_URL: `http://127.0.0.1:${port}`, VITE_PROTOTYPE_MODE: 'false', VITE_BUYER_URL: '', VITE_SELLER_URL: '', VITE_ADMIN_URL: '', VITE_COURIER_URL: '', AUTH_BASE_URL: `http://127.0.0.1:${port}`, AUTH_API_BASE_URL: '/api/v1', RESPONSIVE_BASE_URL: `http://127.0.0.1:${port}` };
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port)], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'inherit'] });
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Vite startup timeout')), 30000);
    vite.stdout.on('data', data => { if (String(data).includes('Local:')) { clearTimeout(timer); resolve(); } });
    vite.once('error', error => { clearTimeout(timer); reject(error); });
    vite.once('exit', code => { clearTimeout(timer); reject(new Error(`Vite exited ${code}`)); });
  });
  for (const suite of ['auth-smoke.mjs', 'responsive-smoke.mjs']) {
    const child = spawn(process.execPath, [`tests/${suite}`], { env, windowsHide: true, stdio: 'inherit' });
    const [code] = await once(child, 'exit');
    if (code !== 0) throw new Error(`${suite} failed: ${code}`);
  }
} finally {
  vite.kill();
  if (vite.exitCode === null && vite.signalCode === null) await once(vite, 'exit');
}
