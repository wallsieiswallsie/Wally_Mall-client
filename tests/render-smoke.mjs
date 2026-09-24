import { createServer } from 'vite';
import assert from 'node:assert/strict';
import { seedState } from '../src/data/prototype.js';

const state=seedState();
state.cart=[{key:'butter-croissant:',slug:'butter-croissant',quantity:2,variant:''}];
state.sessions=[{id:'PAY-DEMO',checkoutId:state.orders[0].checkoutId,amount:851500,method:'QRIS',status:'pending',expiresAt:new Date(Date.now()+900000).toISOString()}];
let role='buyer';
globalThis.localStorage={getItem:()=>JSON.stringify(state)};
globalThis.sessionStorage={getItem:()=>JSON.stringify({role,id:role==='buyer'?'WB-10281':role,seller:'ruang-sole'})};
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
 const {renderRoute}=await server.ssrLoadModule('/tests/render-fixture.jsx');
 const cases=[['buyer','/'],['buyer','/login'],['buyer','/product/nike-air-force-white'],['buyer','/cart'],['buyer','/checkout'],['buyer','/payment/PAY-DEMO'],['buyer','/orders'],['buyer',`/orders/${state.orders[0].id}`],['seller','/seller/dashboard'],['seller','/seller/orders'],['seller',`/seller/orders/${state.orders[0].id}`],...['','orders','sellers','products','categories','reports','moderation','support'].map(p=>['admin',`/admin/${p}`]),...['','transactions','orders','buyers','sellers','products','categories','operations','reports','admins','platform-fee','moderation','audit-log','settings'].map(p=>['super_admin',`/super-admin/${p}`])];
 for(const [r,path] of cases){role=r;const html=renderRoute(path);assert.ok(html.length>1000,`Empty render: ${path}`);if(r==='admin'){for(const forbidden of ['Gross Merchandise Value','Platform Revenue','Seller net earnings','Platform Fee Settings','Admin Management','nawal@example.com','Nawal Alhamid','081248761291'])assert.ok(!html.includes(forbidden),`Sensitive data in ${path}: ${forbidden}`);}console.log(`PASS ${r} ${path}`);}
 role='admin';const blocked=renderRoute('/super-admin/platform-fee');assert.ok(blocked.includes('Akses terbatas'));assert.ok(!blocked.includes('Default transaction fee'));console.log('PASS direct unauthorized financial route is blocked');
 console.log(`${cases.length+1} route checks passed.`);
} finally {await server.close();}
