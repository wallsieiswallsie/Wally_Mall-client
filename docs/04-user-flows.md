# Current user flows

[Route inventory](05-information-architecture.md) · [Requirements](02-product-requirements.md)

These flows reconstruct [AppRoutes](../client/src/routes/AppRoutes.jsx) and page handlers. All routes are public. A node marked preview is a simulation, not a backend operation.

## Buyer discovery

```mermaid
flowchart TD
  H["/ Home"] --> Q["/search?q=... or /explore"]
  H --> C["/categories"]
  C --> K["/category/:slug and subcategory chips"]
  Q --> L[Filter and sort products]
  K --> L
  L --> P["/product/:slug"]
  Q --> T["/search?tab=toko"]
  T --> S["/store/:slug"]
  P --> S
  S --> P
  P --> N[Contact preview notice]
  S --> N
  P --> F["Save then /favorites"]
  P --> U[Share dialog and copy current URL]
```

**Entry point:** Home, search, explore, category, or a direct detail link. **Main steps:** search/browse, optionally filter/sort, inspect product/store, save/share or click contact. **Exit state:** viewed sample information, changed session favorites, copied URL, or read a contact notice. **Known limitations:** no seller communication, purchase, order, location distance, or persistent favorites. Missing product/store/category slugs show empty states; unmatched routes show a fallback screen. Store About is an in-page tab, not a separate route.

## Registration and seller onboarding

```mermaid
flowchart TD
  R["/register"] --> B[Buyer selection and valid form]
  B --> N[Registration preview notice]
  R --> S[Seller selection and valid form]
  S --> O["/seller/register"]
  H[Home Buka Lapak or direct link] --> O
  O --> I[Informasi Toko]
  I --> L[Lokasi]
  L --> K[Kategori Usaha]
  K --> P[Preview Lapak]
  P --> E[Selesai]
  E --> D[Click dashboard link: save form to React state]
  D --> V["/seller/dashboard"]
  A["/login valid form"] --> M[Login preview notice]
```

**Entry point:** `/register`, `/login`, or directly `/seller/register` from Buka Lapak. **Main steps:** seller registration navigates to onboarding; five steps gather store name/description, area/landmark, and business category, then preview and completion. **Exit state:** the completion dashboard link sets `demoStore`; no account/store is created. **Known limitations:** authentication is not a prerequisite; registration credentials are not carried into onboarding; taking the Home link instead does not save `demoStore`. Reload resets the preview.

## Product management preview

```mermaid
flowchart LR
  D["/seller/dashboard"] --> A["/seller/products/new"]
  A --> F[Fields, tags and optional example photo]
  F --> P[Preview modal]
  P --> S[Save to demoProducts]
  S --> D
  D --> E[Open a fixture product detail]
  D --> N[Preview-product status notice]
```

**Entry point:** dashboard or a direct add-product link. **Main steps:** complete product fields, optionally choose a supplied photo and tags, preview, save to dashboard. **Exit state:** a session-only item is prepended to Ruang Sole's example product list. **Known limitations:** no edit/delete, upload, permanent ID, public detail page, public publication, order receipt, or cross-session persistence. Store profile is a notice; the “view example storefront” link always opens `/store/ruang-sole` even after another store name is entered.

## Admin and transaction flows

Neither exists. No diagram invents admin authentication, moderation, category management, marketplace monitoring, checkout, or order fulfillment. Future operating requirements are recorded in the [roadmap](15-roadmap.md).
