# Business rules

[Requirements](02-product-requirements.md) · [Database proposal](07-database-design.md) · [Audit](audit-report.md)

The status column distinguishes observable UI behavior from recommended persistent-service rules. Proposed rules require product confirmation and server enforcement; they do not describe controls that already exist.

| ID | Rule | Status / evidence |
| --- | --- | --- |
| BR-001 | Public catalog entries, sellers, stock, ratings and badges are examples | Current: fixture modules and UI notices |
| BR-002 | Each fixture product references one seller and one category with a subcategory string | Current: `products.js`; JS references, not database foreign keys |
| BR-003 | Every query token must occur as a substring in supported fields | Current: `Search.jsx`; no synonym or relevance engine |
| BR-004 | Product location filtering uses the associated seller's location | Current: `Search.jsx`; no distance logic |
| BR-005 | Favorites and seller preview changes reset on reload | Current: layout React state |
| BR-006 | Contact actions stop at a notice; they do not send interest or orders | Current: product/store handlers |
| BR-007 | Onboarding reaches dashboard state only through its completion dashboard link | Current: `setDemoStore(form)` in completion link |
| BR-008 | Add-product form accepts up to ten distinct lowercase trimmed tags, each input limited to 35 characters | Current: client-side form only |
| BR-009 | Product name required/max 100; price 1..9,999,999,999; stock 1..99,999; description required | Current: HTML constraints; price/stock number inputs use default integer steps, not server validation |
| BR-010 | Onboarding requires store name/max 60, description/max 500, area/landmark and category selection | Current: form stages; no persisted completeness check |
| BR-011 | Saved preview products appear only on the dashboard | Current: separate `demoProducts`; no public slug/seller linkage |
| BR-012 | A seller can modify only their own stores and products | Planned: server identity and ownership checks |
| BR-013 | Public listing/detail/search eligibility requires active store, product and category ancestry | Planned: shared server visibility rule; no current status model |
| BR-014 | Stock may reach zero; default discovery excludes unavailable offerings | Proposed policy: confirm service slots/unknown availability handling |
| BR-015 | Store primary public location determines catalog geography | Planned: aligns current fixture filtering; resolve product-form location mismatch |
| BR-016 | Initial acquisition and marketplace scope is Sorong | Product direction; current labels are hardcoded, proposed server coverage is configurable |
| BR-017 | Contact clicks measure intent, not confirmed communication or sales | Proposed measurement rule; no real contact or event pipeline today |
| BR-018 | Ratings/badges need provenance before being used as real trust or ranking signals | Planned release requirement; existing values are illustrative |

Do not infer a listing-approval process, refund policy, commission, payment guarantee, nationwide delivery, seller verification, or merchant exclusivity from the prototype. Publication and moderation policy remain open decisions in the [roadmap](15-roadmap.md).
