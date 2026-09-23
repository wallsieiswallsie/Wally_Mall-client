# Roadmap

[Business context](01-business-context.md) · [Requirements](02-product-requirements.md) · [Decisions](16-technical-decisions.md)

This proposed maturity roadmap follows the discovery-first product. It is not a delivery commitment: no agreed dates, growth targets, revenue promises or guaranteed expansion exist.

| Stage | Status | Outcome | Evidence/gate |
| --- | --- | --- | --- |
| Phase 0 — Product foundation | **Current** | Sorong discovery and seller previews; documented hypotheses/architecture | Confirm target needs and prototype boundaries |
| Phase 1 — Sorong discovery MVP | **Next / Planned proposal** | Persistent catalog, verified identity, owned listings, agreed contact channel and basic search | Safe writes, correct visibility, merchant consent, useful listings and contact measurement |
| Phase 2 — Seller acquisition and density | **Next / Planned experiment** | Concentrated supply in selected category-area pairs | Seller activation/upkeep, relevant buyer results, manageable support |
| Phase 3 — Search improvement | **Later, evidence-led** | Reviewed aliases and evaluated ranking | Judged query baseline and observed misses justify changes |
| Phase 4 — Transaction capabilities | **Exploratory** | Evaluate in-platform transaction value | Validated demand and capacity to operate new support/risk responsibilities |
| Phase 5 — Geographic expansion evaluation | **Exploratory** | Decide whether another Papua city/region is justified | Validated seller density, buyer demand, retention and operational capacity |

Phases can overlap. Basic deterministic search belongs in the persistent MVP; advanced relevance follows evidence. Wallet, escrow, integrated payments, logistics, advanced promotions and ML are not discovery-MVP requirements.

## Recommended next implementation priorities

1. Validate buyer tasks and initial merchant/category cohort; agree contact and public location policy.
2. Select backend/auth, confirm the [schema](07-database-design.md), and implement owner-scoped persistence/lifecycle.
3. Connect onboarding/product forms to drafts/publication, add maintenance interactions, and remove Ruang Sole fixture dependence.
4. Connect a consented contact channel and measure real attempts without claiming completed sales.
5. Introduce normalized search, consistent area filters and real newest timestamps; add aliases when query evidence supports them.

Moderation must be operationally defined before real public listings; this does not imply a large admin dashboard already exists or is necessary. Reputation, service availability, uploads and multi-store access need deliberate decisions.

## Reconsideration gates

If buyers cannot find useful supply, improve category density and freshness before broader acquisition. If merchants stop maintaining listings, investigate upkeep cost and actual lead value. If contact brings little benefit, evaluate relevance, response quality and channel design. Expansion is a conditional evaluation, not an automatic launch.
