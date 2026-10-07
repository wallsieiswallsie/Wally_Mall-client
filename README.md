# Wally Mall

Wally Mall is a hyperlocal marketplace and commerce discovery platform initially focused on **Sorong, Papua Barat Daya**. Its product direction is to help people discover locally available products and sellers while giving local merchants, home businesses, UMKM, and local brands a structured digital storefront.

**Current stage: client connected to the server API.** Live mode is the default for authentication, catalog, buyer commerce, seller and admin workflows. Payments still use the backend sandbox adapter. Follow the [client/server setup](../README.md) and [integration contract and gaps](../docs/client-server-integration.md). The [transaction prototype guide](docs/17-transaction-prototype.md) and older product documents describe the separate prototype, enabled only with `VITE_PROTOTYPE_MODE=true`.

## Why Wally Mall Exists

The product is built around the hypothesis that local commerce already exists, but discovery is fragmented across Instagram, WhatsApp, Facebook, TikTok, physical stores, and word-of-mouth. A shared discovery layer could make local supply easier to find and compare. The repository contains no market research validating this hypothesis or evidence of real merchant adoption.

## Initial Market

The initial business scope is Sorong. Concentrating on a defined area is intended to increase useful merchant and product density before considering additional markets. This is a strategy to validate, not a claim of market dominance. Expansion into other parts of Papua remains a possibility contingent on demand, retention, supply density, and operational capacity.

## Product Principles

- Local-first discovery and geographic relevance.
- Seller visibility through clear storefronts and product information.
- Searchability using language buyers actually use.
- Simple merchant onboarding and manageable listing upkeep.
- Evidence-led iteration before transaction infrastructure or geographic expansion.

## Current Product

Live visitors browse products, stores and categories from PostgreSQL through the API. Authenticated users manage persistent favorites, addresses and orders. Seller and admin pages use role-protected server routes. The sample catalog and session-only previews remain available exclusively in prototype mode; contact messaging and uploads have no backend adapter yet.

## User Types

Live roles come from `/users/me` or the authentication response and are enforced again by the server. Public registration grants buyer; seller approval grants seller; staff creation is restricted to super admin. Prototype Access shortcuts appear only in explicitly enabled demo mode.

## Core User Journey

```mermaid
flowchart LR
  H[Home] --> D[Search or browse categories]
  D --> P[Product detail]
  D --> S[Store profile]
  P --> S
  P --> F[Session favorites]
  P --> C[Contact preview dialog]
  S --> C
```

See [current user flows](docs/04-user-flows.md) for seller simulations and their limitations.

## System Architecture

A browser runs the React SPA. `src/api/client.js` handles JSON, bearer authentication, refresh/retry and errors; `src/live/ServerApp.jsx` connects routes to the actual Fastify API. `PrototypeContext` remains isolated to demo mode. The older architecture/proposed API documents are historical; [server source contracts](../server/docs/client-api-mapping.md) are authoritative.

## Tech Stack

Derived from `client/package.json`, its lockfile, imports, and Vite configuration. Versions below are locked versions at the documentation audit, not new dependency recommendations.

| Layer | Technology |
| --- | --- |
| UI | React / React DOM 19.3.0, JavaScript JSX |
| Routing | React Router 7.18.4, BrowserRouter |
| Build | Vite 6.4.3, React Vite plugin 4.7.0 |
| Styling | Tailwind CSS / Vite integration 4.3.3, DaisyUI 5.7.42, custom CSS |
| Data and state | REST API, React hooks/context; isolated fixtures in demo mode |
| Backend / database | Fastify / Knex / PostgreSQL in ../server |

## Repository Structure

```text
Wally_Mall/
  docs/                    Product, business, engineering, and audit documentation
  client/
    src/components/        Shared UI, product, seller, category, search components
    src/data/              Sample products, sellers, categories
    src/layouts/           Shared navigation and session-only preview state
    src/pages/             Discovery, detail, auth and seller preview screens
    src/routes/            Actual route configuration
    src/utils/             IDR price formatting
    src/assets/            Asset notes; wordmark is implemented in JSX
    src/styles.css         Theme, layout and responsive styling
    package.json           Client scripts; server has its own package
  .env.example             API base URL, Vite proxy target, opt-in prototype flag
  CONTRIBUTING.md          Local workflow and review expectations
```

## Getting Started

Use Node.js and npm; the audit environment uses Node 22.14.0 and npm 10.9.2. No runtime version is pinned in this project. From the Wally Mall directory:

```sh
cd client
npm ci
npm run dev
```

Development binds to `127.0.0.1:5173`. Copy [.env.example](.env.example) to `.env` and configure/start the server as described in the [root setup guide](../README.md). Use `VITE_PROTOTYPE_MODE=true` only for the browser-only prototype.

```sh
npm run build
npm run preview
```

These commands run from `client/`. Build output is `client/dist/`. Preview is only a local build check. Available checks are `npm test`, `npm run test:render`, and `npm run build`; there is no lint/typecheck script. Migration, seed and backend test commands belong to `server/package.json`. See the [current deployment configuration](../README.md#deployment-frontend); production static hosting does not use the Vite proxy.

## Documentation

Start with the [product overview](docs/00-product-overview.md), [business context](docs/01-business-context.md), or [audit report](docs/audit-report.md).

| Product and business | Engineering and operations |
| --- | --- |
| [02 Requirements](docs/02-product-requirements.md) | [06 System architecture](docs/06-system-architecture.md) |
| [03 Proto-personas](docs/03-user-personas.md) | [07 Proposed database](docs/07-database-design.md) |
| [04 User flows](docs/04-user-flows.md) | [08 Search and discovery](docs/08-search-and-discovery.md) |
| [05 Information architecture](docs/05-information-architecture.md) | [09 Proposed API](docs/09-api-design.md) |
| [11 Business rules](docs/11-business-rules.md) | [10 Authentication and authorization](docs/10-authentication-and-authorization.md) |
| [12 Analytics and KPIs](docs/12-analytics-and-kpis.md) | [13 Security and privacy](docs/13-security-and-privacy.md) |
| [15 Roadmap](docs/15-roadmap.md) | [14 Deployment](docs/14-deployment.md) |
| [Contributing](CONTRIBUTING.md) | [16 Technical decisions](docs/16-technical-decisions.md) |

## Product Status

| Status | Scope |
| --- | --- |
| **Current** | Sample-catalog discovery, detail/store pages, temporary favorites, simulated onboarding/dashboard/product forms |
| **Planned — proposed next scope** | Persistent catalog, real identity and ownership checks, seller publishing, an agreed contact channel, measurement |
| **Future — exploratory** | Monetization, transaction capabilities, behavioral/semantic ranking, geographic expansion evaluation |

Planned items in these documents are recommendations, not committed delivery dates or existing capabilities.

## Project Direction

Wally Mall is being developed as both a real business/product experiment and a production-oriented software platform. Software is the operating product through which local discovery, merchant participation, and marketplace usefulness can be tested. Production readiness remains work ahead; the current prototype demonstrates the experience and the proposed architecture documents the next boundaries to build.
