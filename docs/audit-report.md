# Repository audit and documentation report

Audit date: **2026-09-22**. [Documentation home](../README.md#documentation).

## Scope and evidence

Inspected project inventory, package/lockfile, Vite/HTML/CSS configuration, route tree, all pages, shared components, fixtures, README/asset notes, source state behavior, environment references and Git context. No applicable AGENTS.md or server/database package was found. Dependency internals and generated assets were excluded as application source. This is source/build/documentation verification, not a new browser or security certification.

Primary evidence: [routes](../client/src/routes/AppRoutes.jsx), [layout](../client/src/layouts/MarketplaceLayout.jsx), [search](../client/src/pages/Search.jsx), [auth](../client/src/pages/Auth.jsx), [onboarding](../client/src/pages/SellerOnboarding.jsx), [product form](../client/src/pages/AddProduct.jsx), [dashboard](../client/src/pages/SellerDashboard.jsx), [scripts](../client/package.json).

## A. Existing product flow discovered

Visitors move from Home/search/category to fixture product/store pages, optionally save favorites/copy links, and reach contact-preview notices. Seller-intent registration routes to five-step onboarding; Buka Lapak reaches it directly. The completion dashboard link saves form state; adding a product saves only to the session dashboard. No authenticated seller, public publishing, editing/deletion, customer-interest receipt, order or admin flow exists. See [diagrams](04-user-flows.md).

## B. Documentation files created or updated

Created root README, CONTRIBUTING, comments-only `.env.example`, this report, and all 17 requested numbered documents:

- [00 Product overview](00-product-overview.md)
- [01 Business context](01-business-context.md)
- [02 Product requirements](02-product-requirements.md)
- [03 Proto-personas](03-user-personas.md)
- [04 Flows](04-user-flows.md)
- [05 Information architecture](05-information-architecture.md)
- [06 System architecture](06-system-architecture.md)
- [07 Database design](07-database-design.md)
- [08 Search and discovery](08-search-and-discovery.md)
- [09 API design](09-api-design.md)
- [10 Authentication/authorization](10-authentication-and-authorization.md)
- [11 Business rules](11-business-rules.md)
- [12 Analytics/KPIs](12-analytics-and-kpis.md)
- [13 Security/privacy](13-security-and-privacy.md)
- [14 Deployment](14-deployment.md)
- [15 Roadmap](15-roadmap.md)
- [16 Technical decisions](16-technical-decisions.md)

Updated client README to point to the main documentation and avoid stale verification/flow claims. Application source, dependency definitions and databases were not changed; no migrations were created.

## C. Proposed database entities

Core: `users`, `stores`, `store_locations`, hierarchical `categories`, `products`, `product_images`, `tags`, `product_tags`, `favorites`. Derived V1 search: `product_search_documents`. V2 vocabulary: `search_aliases`. The [schema](07-database-design.md) includes fields/types, relationships, constraints, index reasons, lifecycle, privacy boundaries and ERD.

Deferred: seller profiles, variants, multi-category joins, real reviews, behavioral-event tables, admin actions, orders/payments. Identity/session records depend on provider selection. No arbitrary production data was seeded.

## D. Existing versus planned features

| Current | Proposed next | Exploratory |
| --- | --- | --- |
| Fixture search/browsing and product/store pages | Persistent catalog and lifecycle/maintenance | Transaction capabilities |
| Session favorites/seller previews | Verified identities and owned writes | Monetization |
| Contact notices | Consented contact channel and events | Behavioral/semantic ranking |
| Example suggestions/metrics | Search evaluation and real KPIs | Other Papua markets after validation |

## E. Technical inconsistencies discovered

| Finding | Consequence / recommendation |
| --- | --- |
| Newest reverses fixtures; Home calls first five new | No chronology; introduce publication timestamps |
| Relevant preserves source order | No scored ranking; evaluate future retrieval |
| `hp` matches an explicit fixture tag, not an alias | `smartphone` returns none; `phone` also matches headphone; test token-aware retrieval |
| Description is not searched; store/product fields differ | Specify actual and proposed semantics clearly |
| Filters have four areas; seller/product forms have six | Barat/Kepulauan unavailable in filter; unify canonical geography |
| Product form has location; public catalog uses seller location | Resolve store versus product availability location |
| Dashboard includes Ruang Sole items and fixed storefront link | Entering another store name creates no public storefront |
| Preview products lack IDs/slugs/seller links | Cannot safely enter existing public card/detail/search flows |
| Auth is simulated and seller routes unguarded | Server authorization required before persistent writes |
| Two gallery views reuse one image | Not two independently stored product photos |
| Reputation, popular/recent terms and metrics are samples | No traction or trust claims; provenance needed |
| Several joins assume valid fixtures | Malformed relationships can throw; validate future server data |
| No error/analytics pipeline; some Home images lack card fallback | Operational/error-handling work remains |
| Prior README suggested clearing all favorites | Actual Favorites uses individual heart toggles; documentation corrected |
| Client `.gitignore` ignores `.env*` | Root example intentionally outside it; no required env values |
| Git root is parent My_Project | Stage Wally Mall paths only; sibling changes are unrelated |

These findings were documented without silent application refactors.

## F. Product/business assumptions discovered

The product assumes a shared discovery layer helps Sorong buyers, merchants will maintain listings, relevant discovery leads to contact, and category/area density supports repeat visits. None is validated by repository research. Sample founding-seller badges, ratings and joined dates do not prove acquisition. Revenue, market size, successful sales and expansion remain unproven. [Business context](01-business-context.md) proposes validation experiments.

## G. Important decisions requiring confirmation

Confirm merchant/category cohort and pilot success criteria; contact channel/consent; public location detail; multi-store entitlement; store versus product location; service stock/availability; publication/moderation; real reputation or removal; identity/session/recovery approach; backend/hosting/migrations; analytics consent/retention; and whether any revenue experiment is justified. These remain implementation decisions, not blockers to documentation delivery.

## H. Recommended next implementation priorities

Validate discovery tasks and merchant upkeep costs; agree contact/privacy/publication policy; implement identity and owned persistent catalog; connect forms to lifecycle and maintenance; add real contact/measurement; improve deterministic search from judged examples. Evaluate other regions only after density, demand, retention and operating capacity are demonstrated. See [roadmap](15-roadmap.md).

## Verification and limits

Existing frontend build passed (Vite 6.4.3, 61 modules) after a filesystem-access retry; no app changes were needed. A temporary Node check validated 144 local links/anchors across 21 Markdown files, balanced code fences, and all product-to-seller/category/subcategory references. Fixture checks confirmed 15 products, 5 sellers and 11 categories; query checks confirmed `hp` and `handphone` find the iPhone fixture while `smartphone` returns no results. Route coverage and environment references were reviewed against source. Seven Mermaid blocks were reviewed structurally; no rendered diagram/browser regression result is claimed. Dependencies were reused, not freshly installed or vulnerability-audited. No automated test/lint scripts or backend/database exist to test. No deployment or database operation occurred.
