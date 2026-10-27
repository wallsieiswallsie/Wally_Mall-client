import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {}) });
try {
  for (const [portal, port, route, heading] of [['buyer',5188,'/orders','Pesanan'],['seller',5189,'/seller/dashboard','Dashboard seller'],['admin',5190,'/admin','Halo, tim Wally.']]) {
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
        const data=pathname.endsWith('/auth/refresh')?{user,access_token:'fixture-access',refresh_token:'fixture-refresh'}:pathname.endsWith('/users/me')?user:pathname.endsWith('/overview')?{days:30,generated_at:'2026-01-01T00:00:00.000Z',operations:{orders_today:0,awaiting_payment:0,awaiting_processing:0,processing:0,awaiting_delivery:0,completed_today:0,pending_applications:0,products_pending_review:0,open_reports:0,support_cases:null},orders_in_range:0,statuses:{},queues:{applications:[],products:[],reports:[]},unavailable:{support_cases:'SUPPORT_CASE_MODEL_MISSING'},...(roles.includes('super_admin')&&pathname.startsWith('/api/v1/super-admin')?{finance:{gmv:'0',revenue:'0',transactions:0,orders:0,aov:null,previous:{gmv:'0',revenue:'0',transactions:0,orders:0},active_buyers:0,active_stores:0,total_buyers:0,total_stores:0,active_store_accounts:0,total_products:0,simulated_paid_orders:0,rates:{completion:null,cancellation:null,refund:null,repeat_purchase:null,payment_success:null},trend:[]}}:{})}:[];
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
        await page.getByRole('alert').filter({hasText:'Halaman ini tidak tersedia untuk akun Anda'}).waitFor();
        roles=['super_admin'];
        await page.reload();
        await page.getByRole('heading',{name:'Overview marketplace',exact:true}).waitFor();
        await page.goto(base+'/admin');
        await page.getByRole('heading',{name:'Halo, tim Wally.',exact:true}).waitFor();
      }
      roles=portal==='buyer'?['seller']:['buyer'];
      await page.goto(base+route);
      await page.getByRole('alert').filter({hasText:portal==='admin'?'Halaman ini tidak tersedia untuk akun Anda':'Akun ini tidak memiliki akses'}).waitFor();
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
