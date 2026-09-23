# Technical decisions

[Architecture](06-system-architecture.md) · [Database](07-database-design.md) · [Audit](audit-report.md)

Records distinguish **Observed** choices from **Proposed** decisions. Historical selection reasons and author approvals are not invented.

## ADR-001 — React SPA and Vite

**Status:** Observed. **Context:** the only package is a browser UI prototype. **Options:** SPA versus server-rendered/full-stack application; no original comparison found. **Chosen approach:** React, BrowserRouter and Vite, per imports/config. **Tradeoffs:** reusable interactive UI and static output; client rendering, deep-link host fallback and a separate future persistence boundary. **Selection rationale:** Rationale to be confirmed.

## ADR-002 — Fixtures and React state

**Status:** Observed. **Context:** data/interactions are explicitly previews. **Options:** fixture state versus persistent API. **Chosen approach:** JS catalog modules and layout outlet context. **Tradeoffs:** infrastructure-free demonstration; reload loses changes and dashboard products never join the public catalog. **Rationale:** preview scope is explicit; historical reasons for exact state structure remain to be confirmed.

## ADR-003 — Tailwind, DaisyUI and custom CSS

**Status:** Observed. **Context:** styling imports/configures these tools plus a Wally theme. **Options:** this combination versus other styling approaches; no comparison recorded. **Chosen approach:** document existing tools. **Tradeoffs:** shared primitives/theme with custom responsive rules; maintainers must understand overrides. **Selection rationale:** Rationale to be confirmed.

## ADR-004 — PostgreSQL persistence

**Status:** Proposed, not installed. **Context:** linked owners, stores, products, categories and favorites need durable integrity. **Options:** relational database, document database or continued fixtures. **Chosen approach for this design:** normalized PostgreSQL-compatible schema. **Tradeoffs:** relational integrity and search can share infrastructure; migrations, recovery and tuning become necessary. **Rationale:** explicit catalog/ownership relationships; backend/provider/version still require confirmation.

## ADR-005 — Separate account, storefront and offering

**Status:** Proposed. **Context:** the current seller fixture combines public storefront context with merchant identity. **Options:** nested seller/product records versus separate entities. **Chosen approach:** users → stores → products, with location/category relations. **Tradeoffs:** clear identity/privacy/lifecycle boundaries and ownership, with joins and a multi-store policy to settle. **Rationale:** public business identity is distinct from account credentials.

## ADR-006 — Sorong policy and extensible geography

**Status:** Proposed. **Context:** initial scope is Sorong; hardcoded form/filter areas differ. **Options:** permanent Sorong-only schema checks versus configurable coverage over structured geography. **Chosen approach:** city/province/district fields plus pilot coverage validation. **Tradeoffs:** needs canonical labels/policy; allows later change without committing to expansion. **Rationale:** geography should be explicit without unnecessary schema lock-in.

## ADR-007 — Relational search before external engines

**Status:** Proposed. **Context:** current search is substring matching with fixture order. **Options:** client matching, PostgreSQL, external engine, semantic retrieval. **Chosen approach:** normalized full text with bounded trigram fallback; later reviewed aliases. **Tradeoffs:** inspectable retrieval with one datastore; projections need refresh and quality requires evaluation. **Rationale:** no scale evidence justifies another system; see [search design and references](08-search-and-discovery.md).

## ADR-008 — Discovery/contact before transactions

**Status:** Observed UI boundary; proposed implementation sequence. **Context:** CTA is contact, with no cart/order route. **Options:** validate discovery/handoff versus build checkout first. **Chosen approach:** useful supply and agreed contact channel first. **Tradeoffs:** smaller transaction scope but incomplete sales attribution. **Rationale:** follows current UI and requested business direction; channel remains unselected.

## ADR-009 — Defer unsupported entities and trust signals

**Status:** Proposed. **Context:** variants, real reviews, orders and admin workflows do not exist. **Options:** broad marketplace schema versus flow-driven entities. **Chosen approach:** defer unsupported tables and omit fixture reputation from real API contracts. **Tradeoffs:** smaller model; later evidence may require migrations. **Rationale:** avoid imitating large marketplaces without product justification.

## ADR-010 — Identity architecture

**Status:** Unresolved. **Context:** password forms have no service. **Options:** first-party credentials/sessions or managed identity provider. **Chosen approach:** none; schema/API assume a candidate session boundary for review. **Tradeoffs:** first-party control adds recovery/credential responsibility; provider adds integration/dependency concerns. **Rationale:** Rationale to be confirmed before implementation. JWT or a specific provider cannot be inferred from JSX.
