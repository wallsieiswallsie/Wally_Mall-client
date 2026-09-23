# Product requirements

[Overview](00-product-overview.md) · [Flows](04-user-flows.md) · [Rules](11-business-rules.md)

## Product Objective

Test whether a Sorong-focused catalog helps buyers discover local supply and gives merchants a useful storefront. The current deliverable tests the interaction model; it cannot validate real transactions or sustained seller participation.

## User Problems and Types

Visitors/buyers need relevant products and seller context. Sellers need visibility and manageable listing setup. These are assumptions described in [proto-personas](03-user-personas.md). Buyer/seller options exist in registration but no authenticated role exists. Admin is not a current user type.

## Functional Requirements

| ID | Requirement / screen | Status and acceptance boundary |
| --- | --- | --- |
| FR-001 | Search products at `/search?q=...` | Current: all whitespace-separated tokens match substrings across supported fixture fields |
| FR-002 | Browse `/categories` and `/category/:slug` | Current: category and subcategory constrain fixture products |
| FR-003 | Discover stores with `tab=toko` and `/store/:slug` | Current: fixture search, product list and About tab |
| FR-004 | Filter/sort product listings | Current: category, price, seller area, rating; price sort and reversed fixture order for newest |
| FR-005 | Inspect `/product/:slug` | Current: sample price, stock, description, tags, seller and related products |
| FR-006 | Save favorites and share links | Current: in-memory favorites; clipboard copy with fallback notice |
| FR-007 | Express interest through contact button | Current simulation: modal only; real channel Planned |
| FR-008 | Choose buyer/seller registration | Current simulation: seller selection leads to onboarding, other submissions show notices |
| FR-009 | Set up a storefront at `/seller/register` | Current simulation: five steps; completion link passes form state to dashboard |
| FR-010 | Add product at `/seller/products/new` | Current simulation: required fields, up to ten tags, example photo, preview then dashboard save |
| FR-011 | Inspect seller dashboard | Current simulation: Ruang Sole fixtures plus session products and sample statistics; no edit/delete |
| FR-012 | Persist identity, stores, products and favorites | Planned: survives reload; owner-scoped writes enforced by server |
| FR-013 | Publish and maintain merchant listings | Planned: explicit visibility state, valid store/category links and reliable update flow |
| FR-014 | Improve deterministic search | Planned: [normalization, full text, aliases](08-search-and-discovery.md), measured against judged examples |
| FR-015 | Measure discovery-to-contact behavior | Planned: deduplicated events excluding fixtures; click does not mean sale |

No admin screens, payment flow, booking system, or order management requirements are inferred from the current UI.

## Non-functional Requirements

| ID | Requirement | Current evidence / proposed acceptance |
| --- | --- | --- |
| NFR-001 | Responsive, accessible discovery | Responsive CSS, labels and native dialogs exist; manually verify keyboard use and mobile layouts per change |
| NFR-002 | Durable and consistent catalog | Planned: transactional writes, referential integrity and recovery exercise |
| NFR-003 | Access control | Planned: unauthenticated writes fail; cross-owner requests fail even with modified resource IDs |
| NFR-004 | Search performance and relevance | No service-level target exists; measure representative mobile latency and judge relevance before setting budgets |
| NFR-005 | Honest, privacy-aware measurement | Planned: minimal event fields, documented retention, no raw contact details in analytics |
| NFR-006 | Deployable deep links | Static host must serve SPA entry for application routes; hosting configuration not present |

## Success Metrics

Candidate outcomes are active searchable products, activated sellers, and buyer-to-seller contact attempts. None is an official North Star. See [KPIs](12-analytics-and-kpis.md) for definitions, denominators, and observability limits. Establish a real baseline before numerical targets.

## Constraints

Frontend only; sample data; no persistence, backend validation, real contact, telemetry, test runner, or lint setup. Initial business scope is Sorong. Avoid building nationwide marketplace, payments, logistics, or AI infrastructure before evidence warrants it.

## Open Questions

Confirm initial merchant/category cohort, store ownership cardinality, real contact channel, public location granularity, publication/moderation policy, service-slot semantics, backend/auth selection, and measurable pilot success criteria. See the [audit decision register](audit-report.md#g-important-decisions-requiring-confirmation).
