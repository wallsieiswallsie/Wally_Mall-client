# Responsive UI audit and implementation

Date: 2026-10-07. Scope: live Explore and the shared live shell/catalog consumers.

## Architecture verified before implementation

- `src/main.jsx` mounts React inside React Router's `BrowserRouter` and imports `styles.css`.
- `src/App.jsx` imports `transaction.css` and selects live `ServerApp` by default. Only `VITE_PROTOTYPE_MODE=true` selects `PrototypeProvider` and `AppRoutes`.
- `src/live/ServerApp.jsx` owns the live session context, routes, shell, catalog, cards and async resource helpers. `createApi` in `src/api/client.js` restores authentication, handles JSON envelopes, refresh/retry and errors; `src/api/session.js` supplies session storage. `Guard` and `destination` use server-provided roles.
- Live structure: `ServerApp → Context.Provider → LiveRoutes → Shell → Outlet → Catalog → search form + Resource → Cards/StoreCards + pagination`. Explore and Search share Catalog; category and Favorites variants share it too. Home and store/detail consumers also use the live cards.
- The opt-in prototype has a separate `AppRoutes → MarketplaceLayout` tree, prototype search components, and `components/product/ProductCard.jsx`. That ProductCard depends on prototype context and fixture seller lookup; reusing it for live API records would change the data architecture. The implementation retains the actual live Cards renderer.
- Styling: Tailwind 4 and DaisyUI 5 via `vite.config.js`, with the Wally theme and custom CSS in `styles.css`, transaction styles and `live/live.css`. Existing tokens supply neutral surfaces, gold accent, borders, typography and radii. No new framework/dependency was added.
- Existing responsive thresholds: 374, 767, 900 and 1150px in global styles; 720px for live product details; transaction styles additionally use 400, 800 and 1440px. Catalog/shell changes reuse the relevant global thresholds. Validation widths are not additional breakpoints.
- Existing dimensions: 1256px outer content width, desktop 28px gutters, phone 20px gutters, small-phone 16px gutters. Existing product grid: two columns on phones, three through 900px, four through 1150px, five above that.

## Root causes and original sources

| Source | Confirmed cause |
| --- | --- |
| `ServerApp.jsx`, Shell; `live.css`, `.live-nav` and former 720px header rule | Live header always rendered all links in a wrapping flex row. Global mobile rules hide `.desktop-nav`, used only by the prototype. The live override stacked logo/navigation instead of reducing the primary header. |
| `ServerApp.jsx`, Shell's former `main.page.live-page`; `styles.css`, `.page`; `live.css`, `.live-page` | Live main bypassed `.main-content`'s maximum width. The later-loaded `.page` padding shorthand also overrode live gutters. |
| `live.css`, `.live-search`; `styles.css`, `.input, .select, .textarea` | Flexible search input competed with full-width selects. Flex wrapping was not an intentional mobile composition. |
| `ServerApp.jsx`, Catalog | Intro lacked the existing page-heading spacing. Pagination used generic `.w-actions`, without spacing or a result navigation landmark. |
| `ServerApp.jsx`, Cards; `styles.css`, `.product-visual` | Empty results returned a bare paragraph. The live image wrapper was an inline link, while prototype image wrappers were block elements; aspect-ratio did not size the live wrapper correctly. Long live seller/placeholder text lacked containment. |
| `live.css`, `.live-page`; `styles.css`, `.footer-main`, `.bottom-nav` | A 65vh page minimum replaced a structural viewport-filling shell. Mobile footer clearance was fixed while bottom-nav padding included a safe-area inset. |
| `ServerApp.jsx`, Shell | Plain links never activated the existing active-navigation styles. |

Production screenshot files were not supplied in this attachment. Exact before/after comparison against those screenshots: **Not verifiable from the current codebase/context.** Findings above are grounded in source and local rendered behavior.

## Implementation and shared impact

| File | Responsibility, change and reason | Phone | Tablet/laptop | Desktop/wide desktop | Shared impact |
| --- | --- | --- | --- | --- | --- |
| `src/styles.css` | Extract existing dimensions into `--page-max-width`, `--page-gutter`, `--bottom-nav-height`; consume them in established layout rules; include safe area in prototype footer clearance. | Consistent 16/20px gutters. | Existing 28px gutters. | Existing 1256px bound. | Prototype header/main/footer keep their existing dimensions except the smallest footer gutter now aligns with content; safe-area clearance improves. |
| `src/live/ServerApp.jsx`, Shell | Wrap in flex shell; drop conflicting `.page` class; desktop NavLinks; existing Modal for secondary/role navigation; bottom-nav `aria-current`; restore focus when menu closes. Same destinations, role conditions and logout action. | Brand + Menu, bottom nav remains primary. | Horizontal primary links + Menu through 1150px. | Full horizontal navigation above 1150px. | All live routes, including authenticated and internal pages. |
| `src/live/ServerApp.jsx`, Catalog | Reuse page-heading, wrap results with busy state/label, use a pagination navigation landmark. Form handlers, queries and offsets unchanged. | Deliberate stacked form and usable pagination. | Single search/filter row from 768px. | Search takes remaining width, stable selects/button. | Explore, Search, category and Favorites. |
| `src/live/ServerApp.jsx`, Cards | Reuse EmptyState, Icon and product-seller class; preserve live record shape/actions. | Contained image placeholders and long names. | Existing three/four-column grid. | Existing five-column grid within bounded container. | Every live Cards consumer. |
| `src/live/live.css` | Shell flex growth, shared container, navigation visibility, grid form, feedback surfaces, pagination, block image links and long-text wrapping. Adapt live StoreCards' actual direct-child markup. | Footer follows content and clears fixed nav plus safe area. Sort/type use two columns from 375px; smaller phones and single-filter variants stack. | Main expands with content; controls have at least 46px height. | Footer naturally reaches viewport bottom for short content; wide screens retain centered reading width. | Live shell, live grids and store-card consumers. |
| `src/components/common/UI.jsx` | EmptyState supports `to={null}` and omits absent description markup. | Same familiar icon/typography. | Same. | Same. | Existing default destinations/actions remain intact. |
| `tests/responsive-smoke.mjs` | Optional browser matrix using Playwright supplied by the host. All API requests are intercepted with deterministic fixtures. | Width/overflow, footer, menu and controls. | Row composition and role links. | Maximum width, grid and navigation. | No runtime dependency or package script changes. |

No application-wide overflow hiding, arbitrary page heights, server edits or API-contract changes were introduced. The shell minimum is viewport-based; main grows using flex. Fixed bottom navigation reserves its actual 61px plus `env(safe-area-inset-bottom)` in the live shell.

## Data behavior preserved

Catalog reads `q`, `sort`, `tab` and `offset` from URL search params. Form submission serializes FormData and resets pagination by omitting offset. There is no Catalog debounce. Requests still use `/search` or authenticated `/favorites`, `limit=30`, product/store type, and a category ID resolved through `/categories`. Previous/next still subtract/add 30; previous disables at zero, next disables for fewer than 30 records. Resource still owns abort, loading, success, error and retry. Authentication and role guards are unchanged.

## Verification

The repository offers `npm test`, `npm run test:render`, and `npm run build`. No lint or typecheck script exists. Older CONTRIBUTING statements about missing tests/backend are stale; package scripts and current source were used.

Browser QA runs against the live Vite app in headless installed Edge, with every `/api/v1/**` request intercepted. Fixtures cover image/missing-image products, long names, stores, empty results, loading, error/retry, guest and four authenticated roles. This validates rendering and outgoing query construction, not a production backend.

Reproduce with a live-mode local server and a host-provided Playwright installation:

```powershell
rtk npm run dev
# In a separate terminal, set these to the installed runtime and desired artifact directory:
$env:PLAYWRIGHT_MODULE = '<absolute path to playwright/index.mjs>'
$env:PLAYWRIGHT_CHANNEL = 'msedge'
$env:RESPONSIVE_OUTPUT = '<artifact directory>'
rtk proxy node tests/responsive-smoke.mjs
```

Final results:

| Command | Result |
| --- | --- |
| `rtk npm test` | 16/16 unit tests passed. |
| `rtk npm run test:render` | 34/34 existing prototype render/authorization checks passed, including a final run after shared UI edits. |
| `rtk npm run build` | Final production build passed; 84 modules transformed. |
| `rtk proxy node tests/responsive-smoke.mjs` with the runtime environment above | 78 route/state/width checks passed, plus search, pagination, retry, role-link and keyboard assertions; no browser exceptions. |

Empty/product/store catalog states were checked at 320, 360, 375, 390, 414, 480, 768, 1024, 1280, 1440, 1536 and 1920px. Each authenticated role was additionally checked at 320, 768, 1024, 1151, 1280 and 1920px. Favorites/category checks ran at 390px. Home, Categories, Login and Register each ran at 320, 768, 1440 and 1920px. No unintended horizontal scrolling was detected in those cases. Footer follows main and clears the fixed bottom navigation at document end. Screenshots were visually inspected for small mobile, normal mobile, tablet, desktop and wide desktop, plus error and populated-card states.

Measured product columns: 2 on phones through 480px, 3 at 768px, 4 at 1024px, and 5 at 1280–1920px. Measured gutters match the existing 16/20/28px conventions. Controls meet the 44px touch-target threshold (form fields are at least 46px).

Browser assertions also verified outgoing search query/sort/type/limit/offset, category ID, previous/next disabled state, error retry, role-specific menu availability, Escape dismissal, focus return to Menu, and Explore's active Cari item. During verification, tablet grid specificity, legacy page padding, and menu focus return were corrected before the passing run.

The first sandboxed Vite startup failed with a Windows/esbuild directory permission error; permitted execution outside that sandbox succeeded. The bundled Playwright browser binary was absent, so QA used installed Edge without downloading dependencies. An initial shell environment-quoting error and fixture timing/Strict Mode issues were corrected in the QA harness. No approval remained blocked.

Artifacts (screenshots and `measurements.json`) were saved to the chat workspace at `C:/Users/nawal/.codex/visualizations/2026/10/07/01a11461-6378-7d13-9f8d-f92349423c96/responsive-qa/`.

Limitations: physical iOS safe-area/mobile-browser behavior, Firefox/Safari, real production catalog data and a visual sweep of every seller/admin/detail/commerce route were not exercised. Their common live shell was tested with each role; existing prototype route regression checks passed. No known responsive failure remains in the verified matrix. No backend, API behavior or authentication behavior was intentionally changed. No Git commit was created; this client directory is untracked within its parent repository.

Suggested commit: `fix(ui): unify responsive marketplace shell and explore layout`
