# Live portals and verification

This repository contains buyer, seller and admin workspaces, shared packages and a compatibility app. Backend source is a separate [server repository](https://github.com/wallsieiswallsie/Wally_Mall-server). Run commands at this repository root; no sibling directory is required.

Use Node 22+, `npm ci`, `npm test`, and `npm run build:all`. Build with VITE_PROTOTYPE_MODE=false and VITE_API_URL set to the backend origin only (no /api/v1). API paths receive that prefix centrally. Optional VITE_BUYER_URL, VITE_SELLER_URL and VITE_ADMIN_URL identify portal origins. Rebuild after changing VITE_* settings. Never include private credentials in these variables.

Railway root directory is `/`. Build `npm run build:buyer` (or seller/admin); start `npm run start:buyer` (or seller/admin). These use scripts/serve.mjs with SPA fallback and Railway PORT. Compatibility app uses `npm run build` and `npm start`. Vite preview is local inspection; API_PROXY_TARGET configures development/preview only. Set backend CORS_ORIGINS and GCS bucket CORS to the exact deployed portal origins.

Seller variant editor uses authenticated GET /seller/products/:id even for stock zero, hidden, draft or pending moderation. The API enforces membership and mutation capabilities. Public catalog visibility remains unchanged.

Order payment navigation uses the server's payment.id, never a required sessionStorage mapping. Pending unexpired payments resume the existing intent; expired/failed payments explain that a new purchase must start from catalog, success and refunds show status and order navigation. Revisiting a payment never creates a checkout.

`npm test` covers unit/domain and fixture behavior; `npm run test:render` covers prototype rendering. Browser scripts that intercept API responses are live UI fixture tests, not native PostgreSQL integration. The server's `npm run test:contract` loads this repository's packages/api-client/client.js via explicit CLIENT_API_MODULE and tests real API/DB behavior. See [backend verification and deployment](https://github.com/wallsieiswallsie/Wally_Mall-server/blob/main/docs/integration-recovery.md).

Deployment and external bucket access are not activated by these local changes. Courier, seller payouts, reviews, promotions and semantic search remain outside this repair.
