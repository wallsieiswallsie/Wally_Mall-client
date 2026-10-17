import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {}) });
try {
  for (const [portal, port, route, heading] of [['buyer',5188,'/orders','Pesanan'],['seller',5189,'/seller/dashboard','Dashboard seller'],['admin',5190,'/admin','Admin']]) {
    const base=`http://127.0.0.1:${port}`;
    const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--config',`apps/${portal}/vite.config.js`,'--host','127.0.0.1','--port',String(port)],{windowsHide:true,stdio:['ignore','pipe','inherit'],env:{...process.env,VITE_API_URL:base,VITE_PROTOTYPE_MODE:'false',VITE_BUYER_URL:'',VITE_SELLER_URL:'',VITE_ADMIN_URL:'',VITE_COURIER_URL:''}});
    try {
      await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Vite timeout')),30000);vite.stdout.on('data',d=>{if(String(d).includes('Local:')){clearTimeout(timer);resolve();}});vite.once('error',e=>{clearTimeout(timer);reject(e);});vite.once('exit',c=>{clearTimeout(timer);reject(new Error(`Vite exited ${c}`));});});
      const context=await browser.newContext();
      await context.addInitScript(()=>sessionStorage.setItem('wally-refresh-token','fixture-refresh'));
      let roles=[portal];
      const page=await context.newPage(), errors=[], calls=[];
      page.on('pageerror',e=>errors.push(e.message));
      await context.route('**/api/v1/**',r=>{
        const pathname=new URL(r.request().url()).pathname;
        calls.push(pathname);
        const user={id:'fixture-user',name:'Fixture user',roles};
        const data=pathname.endsWith('/auth/refresh')?{user,access_token:'fixture-access',refresh_token:'fixture-refresh'}:pathname.endsWith('/users/me')?user:pathname.endsWith('/overview')?{statuses:{}}:[];
        return r.fulfill({json:{data}});
      });
      await page.goto(base+route);
      await page.getByRole('heading',{name:heading,exact:true}).waitFor();
      await page.reload();
      await page.getByRole('heading',{name:heading,exact:true}).waitFor();
      assert.ok(calls.includes('/api/v1/auth/refresh'));
      assert.ok(calls.includes('/api/v1/users/me'));
      if(portal==='admin'){
        await page.goto(base+'/super-admin');
        await page.getByRole('alert').filter({hasText:'Akun ini tidak memiliki akses'}).waitFor();
        roles=['super_admin'];
        await page.reload();
        await page.getByRole('heading',{name:'Super admin',exact:true}).waitFor();
        await page.goto(base+'/admin');
        await page.getByRole('heading',{name:'Admin',exact:true}).waitFor();
      }
      roles=portal==='buyer'?['seller']:['buyer'];
      await page.goto(base+route);
      await page.getByRole('alert').filter({hasText:'Akun ini tidak memiliki akses'}).waitFor();
      const anonymous = await browser.newContext();
      const anonymousPage = await anonymous.newPage();
      await anonymousPage.goto(base+route);
      await anonymousPage.getByRole('heading',{name:'Masuk ke Wally',exact:true}).waitFor();
      assert.equal(new URL(anonymousPage.url()).pathname,'/login');
      await anonymous.close();
      assert.deepEqual(errors,[]);
      await context.close();
      console.log(`PASS ${portal}: live deep link, reload/refresh, role guard and unauthenticated login redirect`);
    } finally {vite.kill();if(vite.exitCode===null&&vite.signalCode===null)await once(vite,'exit');}
  }
} finally {await browser.close();}
