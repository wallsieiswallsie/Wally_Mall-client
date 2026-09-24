# Transactional marketplace prototype

This document supersedes the original discovery-only scope in documents 00–16 where they conflict. The existing Wally design system is retained. This is a browser-only demonstration, not production authentication, payment processing, or settlement.

## Start and demonstrate

Run `npm install`, then `npm run dev` from `client`. Open `/login` and choose **View Super Admin Prototype**, or use the floating **Prototype Mode** button from any page. Four demo accounts share the same login form and password `wally-demo`: `buyer@demo.wally`, `seller@demo.wally`, `admin@demo.wally`, and `super@demo.wally`. Role destinations are `/`, `/seller/dashboard`, `/admin`, and `/super-admin`.

1. View as Buyer, choose a product, select quantity/size, Add to Cart. Add a second shop's product to demonstrate multi-seller grouping.
2. Open cart and checkout, choose a saved/new Sorong address and each seller's delivery/pickup option.
3. Create the order and payment session. The gateway screen provides success, failed, and expired simulations. No QR or bank reference is payable.
4. Simulate success and open the order timeline. Switch to Seller, select the matching demo store, and process the same order through delivery or pickup to completed.
5. Return as Buyer to see the same updated timeline. Super Admin sees that exact order and financial snapshot in Transactions, Buyers, and Sellers.
6. As Admin, review sellers, products, categories, reports and support. Identity is masked. Direct navigation to Super Admin routes is denied.
7. As Super Admin, configure fee rules or manage an admin, enter the confirmation reason, then inspect the read-only Audit Log.

State persists in localStorage under `wally-transaction-prototype-v1`. Role selection is sessionStorage under `wally-demo-session`. Clear these two keys in browser storage to reset the demonstration. Do not enter actual personal information or credentials. The demo store account selector is intentionally exclusive to the demo seller dashboard.

## Boundaries

- `state/PrototypeContext.jsx`: demo session and persisted mock service adapter; projects role-appropriate views and checks every mutation's permission.
- `domain/commerce.js`: authorization guard, cart quotation, fee evaluation, stock reservation, fulfillment transitions, and operational data projection.
- `domain/payment.js`: provider-neutral `PaymentGateway`, mock sessions, webhook outcomes, and refund simulation.
- `domain/analytics.js`: financial aggregation, rates and reporting windows from the same order fixtures.
- `pages/commerce`: cart, checkout, payment, buyer/seller order list and timeline.
- `pages/internal`: operational and strategic views with progressively disclosed details.
- `data/prototype.js`: coherent buyer/seller/order fixtures referencing the existing catalog.

Production must replace the context adapter with authenticated backend services. **Client guards and localStorage are not a security boundary.** The bundled fixtures can be inspected by anyone. Never ship real private records in this bundle. Set `VITE_PROTOTYPE_MODE=false` to disable demo access; this does not supply a production login implementation.

## Production authorization contract

Every sensitive backend endpoint MUST independently verify a server-authenticated identity and role:

```js
router.get('/platform/transactions', authenticate, requireRole('super_admin'), transactions);
router.patch('/platform/fee-rules/:id', authenticate, requireRole('super_admin'), updateFee);
router.post('/platform/admins', authenticate, requireRole('super_admin'), createAdmin);
router.get('/platform/audit', authenticate, requireRole('super_admin'), readOnlyAudit);
router.get('/operations/orders', authenticate, requireRole('admin', 'super_admin'), maskedOrders);
// Seller endpoints must additionally verify order.sellerId === session.sellerId.
// Buyer endpoints must additionally verify order.buyerId === session.buyerId.
```

Admin projections use an allowlist excluding amounts, line-item prices, full addresses and identity. Buyer/seller projections exclude platform and gateway fee analytics. Admin creation always writes `role: 'admin'`; an incoming arbitrary role must never be accepted. Audit writes belong to the server, should be append-only and tamper resistant, and need retention and access policies. Never derive the production role from a request body, UI selector, email prefix, or unsigned browser storage.

## Money and fee semantics

Amounts use integer rupiah. Each seller receives an order under one checkout/payment session. The snapshot stores `gross_order_value`, `platform_fee`, `payment_gateway_fee`, and `seller_net_amount`. Gross means goods value; seller net = gross − platform fee − gateway fee. Delivery is a separate pass-through. Buyer service fee is charged once per checkout and allocated to its first order. Grand total = goods + delivery + buyer service fee − discount.

GMV includes paid, processing, ready, delivery and completed orders; pending, failed, cancelled and refunded orders are excluded. Platform revenue includes seller platform fees plus buyer service fees on those orders. It does not include gateway fees or delivery. No real settlement occurs. Refund is a full-order financial simulation and removes the order from net GMV/revenue analytics.

Fee precedence: active seller-specific rule → active category rule → active default. Match effective/end dates, choosing the newest effective rule within a scope. Fixed, percentage, and combined modes are supported, including 0% promotions. Fixed fees apply once per matched rule group in a seller order. Fees are capped at the applicable goods value. Config changes only affect future orders; already-created pending and paid orders retain their quoted snapshot.

The default, gateway, delivery, buyer service and discount values live in mock platform configuration, never in UI arithmetic. Gateway demo fees are allocated per seller order for clarity; a real provider adapter must reconcile its actual checkout-level fee allocation. Promotions and any platform-funded discounts will require ledger entries in production.

## Payments and inventory

The mock gateway creates a 15-minute payment session. Simulated webhook outcomes are success, failed, expired; terminal sessions reject replay. Failed/expired orders release their live inventory reservation. Historical fixtures do not subtract from current catalog stock. Seller transitions are only paid → processing → ready for delivery → in delivery → completed, or processing → ready for pickup → completed. Sellers cannot set payment states, refund, skip steps, or touch another store's orders.

Production must persist order creation/reservation/payment intents atomically, use idempotency keys and verified provider webhook signatures, reject amount/currency/order mismatches, support retries and reconciliation, expire inventory reservations server-side, and authorize refunds separately. Browser callbacks must never mark a payment as paid.

## Validation

`npm test` runs domain tests. `npm run test:render` renders all marketplace and internal routes, checks operational views for forbidden financial/identity content, and checks direct unauthorized access. `npm run build` creates the production bundle. These are not substitutes for interactive browser and responsive visual QA.
