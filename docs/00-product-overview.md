# Product overview

[Documentation home](../README.md#documentation) · [Business context](01-business-context.md) · [Requirements](02-product-requirements.md)

Wally Mall is a hyperlocal marketplace and commerce discovery platform starting in Sorong, Papua Barat Daya. It brings product discovery and seller storefronts into one experience for local buyers, UMKM, home businesses, and established stores.

The working problem is fragmented discovery: a buyer may need to search multiple social channels or ask people to find a local item. Sellers may have visibility without a searchable catalog. These are product assumptions; the repository includes no customer interviews, market study, or real acquisition results.

## Product Vision

Build a structured discovery and commerce layer for local businesses, beginning with Sorong and evaluating expansion based on marketplace density and validated demand.

## Value and boundaries

For buyers, the intended value is finding relevant local supply with enough information to approach a seller. For sellers, it is a structured storefront and discoverable listings. Neither measurable value nor willingness to pay has been validated here.

**Current stage:** a browser-only interactive prototype with 15 product fixtures, 5 seller fixtures, and 11 category definitions. These counts describe sample coverage, not business traction. The `seller` fixture combines merchant identity and storefront presentation; no real user account exists.

## Product Scope

| In scope now | Boundary |
| --- | --- |
| Search, category browsing, product/store pages | Bundled sample arrays only |
| Filter/sort, related products, link sharing | Local computations; related means same category/seller |
| Favorites | Two preselected examples, React state only |
| Buyer/seller registration and login screens | No account creation or session |
| Five-step seller setup and add-product preview | Dashboard-only state; no public publishing |
| Seller contact action | Dialog explaining future functionality |

Out of scope in the current application: real authentication, persisted catalog, edit/delete listing management, moderation/admin, messaging, orders, checkout, payments, wallets, escrow, logistics, transaction accounting, and multi-region operations. The service category is present, but booking/scheduling is not.

Sorong is the initial business boundary. The UI uses a fixed set of Sorong area labels; it does not enforce a geographic marketplace through server validation or coordinates. Future architecture should preserve extensibility without claiming expansion has occurred.

## Evidence and status language

**Current** means code exists, including simulations explicitly identified as such. **Planned** means recommended implementation or proposed architecture, pending agreement. **Future/Exploratory** means a possibility requiring further evidence. No roadmap dates or commercial commitments are inferred.

Source anchors: [routes](../client/src/routes/AppRoutes.jsx), [fixtures](../client/src/data/products.js), [layout state](../client/src/layouts/MarketplaceLayout.jsx), and [seller onboarding](../client/src/pages/SellerOnboarding.jsx). The [audit report](audit-report.md) records limitations and open decisions.
