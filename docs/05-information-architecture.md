# Information architecture

[Flows](04-user-flows.md) · [Architecture](06-system-architecture.md)

Source of truth: [AppRoutes.jsx](../client/src/routes/AppRoutes.jsx). Every route uses `MarketplaceLayout` with desktop/mobile navigation, footer, outlet state, and notice dialogs. “Audience” below indicates intent, not enforced permissions.

```text
Public discovery
  / → /search or /explore
  /categories → /category/:slug
  /product/:slug ↔ /store/:slug
Buyer utility
  /favorites
Authentication previews
  /login
  /register
Seller previews (also public)
  /seller/register
  /seller/dashboard
  /seller/products/new
Fallback
  *
Admin
  No routes
```

| URL | Page/component | Purpose | Audience | Main actions |
| --- | --- | --- | --- | --- |
| `/` | Home | Discovery entry | Visitor | Search, category, curated links, Buka Lapak |
| `/search` | Search | Search entry | Visitor | Example recent/popular terms and suggestions |
| `/search?q=...` | Search / Listing | Query results | Visitor | Product/store tab, product filters/sort |
| `/search?tab=toko` | Search / Listing | Store discovery | Visitor | Open matching stores; `q` can be combined |
| `/explore` | Search | Browse all fixture products | Visitor | Filters/sort and store tab |
| `/categories` | Categories | Category index | Visitor | Open any of 11 categories |
| `/category/:slug` | CategoryDetail | Category products | Visitor | Subcategory chips, product listing |
| `/product/:slug` | ProductDetail | Item context | Visitor/buyer | Save, share, contact notice, store/related items |
| `/store/:slug` | Store | Storefront | Visitor | Products/About tabs, product filters, contact notice |
| `/favorites` | Favorites | Saved fixture products | Buyer intent | Open items and toggle hearts |
| `/login` | Auth | Login preview | Buyer/seller intent | Valid form opens notice |
| `/register` | Auth | Registration preview | Buyer/seller intent | Select intent, seller proceeds to onboarding |
| `/seller/register` | SellerOnboarding | Five-step store preview | Seller intent | Enter store/location/category, preview, dashboard |
| `/seller/dashboard` | SellerDashboard | Session preview overview | Seller intent | Add product, inspect sample product, profile notice |
| `/seller/products/new` | AddProduct | Product form preview | Seller intent | Select example image, fields/tags, preview/save |
| `*` | EmptyState | Unknown path recovery | Any | Return Home |

`q` and `tab` are URL parameters. Filters and sort are component state, not shareable URL settings. Category sub-selection and Store About are local state. Query changes remount `/search` through its key; category/product/store path changes also remount their screens. Do not treat a URL as a full saved search.

There is no separate buyer dashboard, account profile, admin hierarchy, edit-product route, cart, checkout, or order page. Invalid dynamic slugs render contextual empty states instead of fetching resources.
