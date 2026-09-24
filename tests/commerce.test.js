import test from 'node:test';
import assert from 'node:assert/strict';
import { initialConfig, platformFee, quote, transitionOrder, visibleOrders, inventory, nextSellerStatus, requireRole } from '../src/domain/commerce.js';
import { MockPaymentGateway, refundOrder } from '../src/domain/payment.js';
import { seedState } from '../src/data/prototype.js';
import { metrics } from '../src/domain/analytics.js';
import { authenticateDemo } from '../src/domain/authentication.js';

test('shared login derives four demo roles and disabled demo fails closed',()=>{
 for(const [email,role] of [['buyer','buyer'],['seller','seller'],['admin','admin'],['super','super_admin']]) assert.equal(authenticateDemo(`${email}@demo.wally`,'wally-demo',true),role);
 assert.throws(()=>authenticateDemo('super@demo.wally','wrong',true));
 assert.throws(()=>authenticateDemo('super@demo.wally','wally-demo',false));
});

test('multi-seller quote totals reconcile and pickup removes delivery',()=>{
 const cart=[{slug:'nike-air-force-white',quantity:1},{slug:'butter-croissant',quantity:2}];
 const q=quote(cart,{'ruang-sole':'pickup','dapur-nona':'seller'},initialConfig);
 assert.equal(q.groups.length,2);assert.equal(q.subtotal,940000);assert.equal(q.delivery,10000);assert.equal(q.total,951500);
 assert.equal(quote(cart,{'ruang-sole':'pickup','dapur-nona':'pickup'},initialConfig).delivery,0);
 assert.throws(()=>quote(cart,{'dapur-nona':'local'},initialConfig));
});
test('fee engine supports fixed, percentage, combined and promotional zero with precedence',()=>{
 const lines=[{slug:'butter-croissant',quantity:2,price:45000}];
 const rule={id:'test',name:'test',scope:'all',type:'fixed',fixed:3000,percentage:2,effective:'2026-01-01',active:true};
 const config={...initialConfig,rules:[rule]};
 assert.equal(platformFee(lines,config,'2026-09-24'),3000);
 assert.equal(platformFee(lines,{...config,rules:[{...rule,type:'percentage'}]},'2026-09-24'),1800);
 assert.equal(platformFee(lines,{...config,rules:[{...rule,type:'combined'}]},'2026-09-24'),4800);
 assert.equal(platformFee(lines,initialConfig,'2026-09-24'),3600);
 assert.equal(platformFee([{slug:'nike-air-force-white',price:850000,quantity:1}],initialConfig,'2026-09-24'),0);
 assert.equal(platformFee([{slug:'nike-air-force-white',price:850000,quantity:1}],initialConfig,'2026-11-01'),25500);
 assert.equal(platformFee(lines,{...config,rules:[{...rule,effective:'2027-01-01'}]},'2026-09-24'),0);
});
test('fee snapshots and all seeded financials reconcile across references',()=>{
 const state=seedState(); for(const o of state.orders){assert.equal(o.gross_order_value,o.lines.reduce((n,l)=>n+l.quantity*l.price,0));assert.equal(o.gross_order_value,o.platform_fee+o.payment_gateway_fee+o.seller_net_amount);assert.ok(state.buyers.some(b=>b.id===o.buyer));assert.ok(state.sellers.some(s=>s.slug===o.seller));}
 const snapshot=state.orders[0].platform_fee;state.config={...state.config,rules:[]};assert.equal(state.orders[0].platform_fee,snapshot);
});
test('admin receives masked operational projection without financial or full buyer data',()=>{
 const state=seedState(); const admin=visibleOrders(state,{role:'admin'});for(const o of admin){assert.equal(o.gross_order_value,undefined);assert.equal(o.platform_fee,undefined);assert.equal(o.seller_net_amount,undefined);assert.equal(o.lines[0].price,undefined);assert.ok(o.address.recipient.startsWith('Buyer #'));assert.ok(o.address.phone.includes('*'));assert.equal(o.address.address,undefined);}
 const buyer=visibleOrders(state,{role:'buyer',id:'WB-10281'});assert.ok(buyer.length);assert.ok(buyer.every(o=>o.buyer==='WB-10281'&&o.platform_fee===undefined));
 const seller=visibleOrders(state,{role:'seller',seller:'dapur-nona'});assert.ok(seller.every(o=>o.seller==='dapur-nona'&&o.platform_fee===undefined));
 assert.throws(()=>requireRole({role:'admin'},'super_admin'));
});
test('seller cannot manipulate payments, another shop or skip fulfillment steps',()=>{
 const o={...seedState().orders[0],status:'pending_payment'};const session={role:'seller',seller:o.seller};
 assert.throws(()=>transitionOrder(o,session,'paid'));assert.throws(()=>transitionOrder({...o,status:'paid'},{role:'seller',seller:'not-my-store'},'processing'));
 assert.throws(()=>transitionOrder({...o,status:'paid'},session,'completed'));
 let current={...o,status:'paid',fulfillment:'pickup'};for(const status of ['processing','ready_for_pickup','completed']){assert.equal(nextSellerStatus(current),status);current=transitionOrder(current,session,status);}
 assert.equal(nextSellerStatus(current),undefined);
 assert.throws(()=>transitionOrder({...o,status:'paid'},{role:'admin'},'cancelled','buyer request'));
});
test('mock payment webhook supports success, failure, expiry and rejects replay',async()=>{
 const gateway=new MockPaymentGateway(); const o={...seedState().orders[0],checkoutId:'TEST',status:'pending_payment'};
 const session=await gateway.createSession('TEST',200000,'QRIS');
 const result=gateway.webhook(session,'success',[o]);assert.equal(result.orders[0].status,'paid');assert.ok(result.session.paidAt);
 assert.throws(()=>gateway.webhook(result.session,'success',result.orders));
 assert.equal(gateway.webhook(session,'failed',[o]).orders[0].status,'payment_failed');
 assert.equal(gateway.webhook(session,'expired',[o]).orders[0].status,'cancelled');
 assert.equal(gateway.webhook({...session,expiresAt:'2020-01-01'},'success',[o]).session.status,'expired');
});
test('reserved inventory is released on failure and refunds exclude revenue',()=>{
 const state=seedState();const stock=inventory(state,'butter-croissant');const o={...state.orders[0],live:true,lines:[{slug:'butter-croissant',quantity:2}],status:'pending_payment'};state.orders.push(o);assert.equal(inventory(state,'butter-croissant'),stock-2);o.status='payment_failed';assert.equal(inventory(state,'butter-croissant'),stock);
 const paid=state.orders.find(o=>o.status==='paid');assert.equal(metrics([refundOrder(paid)]).revenue,0);assert.throws(()=>refundOrder({...paid,status:'pending_payment'}));
});
