# Wally Mall frontend

Wally Mall is a hyperlocal marketplace and commerce discovery product starting in Sorong, Papua Barat Daya. This package is its interactive frontend prototype.

Start at the [main README](../README.md) for business context, product status and the documentation index. See [architecture](../docs/06-system-architecture.md), [routes](../docs/05-information-architecture.md), [deployment](../docs/14-deployment.md), and [contribution workflow](../CONTRIBUTING.md) for engineering details.

From this directory:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

No environment variables, backend, database, migrations, seeds, authentication, upload service or real contact/transaction integration are required or implemented. Catalog data, ratings, stock, badges and statistics are examples; Unsplash images are illustrations. Use invented form values.

Search/filtering work on fixtures. Favorites, completed onboarding state and added product previews exist only in React memory and reset on reload. Dashboard preview products do not appear in public search or storefronts. Contact actions show notices. Seller pages have no authentication guard because they are previews.

Suggested walkthrough: Home → search “sepatu” → filter/sort → product → save/share/contact notice → store. Seller walkthrough: Buka Lapak → five onboarding steps → dashboard → add product → example photo/tags → preview → save to dashboard. Remove favorites with each item's heart button.

The build was verified during the 2026-09-22 documentation audit; see [verification scope](../docs/14-deployment.md#verification-recorded-for-this-audit). No fresh browser regression result is asserted here.
