# Deployment

[Architecture](06-system-architecture.md) · [Contributing](../CONTRIBUTING.md) · [Audit](audit-report.md)

## Current deployment evidence

The repository contains a Vite frontend and lockfile. No production host, domain, deployment manifest, Dockerfile, CI workflow, backend, database, migration tool or cloud storage configuration was found. An existing public deployment cannot be established from repository evidence.

## Local development and build

From the project directory:

```sh
cd client
npm ci
npm run dev
```

Open the URL Vite prints; development binds to `127.0.0.1`. From `client/`, build and inspect the output:

```sh
npm run build
npm run preview
```

Build emits `client/dist/`; preview serves it locally for inspection. There is no root package or separate frontend/backend runner. No `.env` copy, database startup, migration or seed step is needed. [.env.example](../.env.example) records the zero-variable configuration.

The audit environment is Node 22.14.0 / npm 10.9.2, not a committed runtime policy. Confirm/pin a supported runtime when CI/hosting is selected. Use `npm ci` to install from the existing lockfile.

## Static hosting requirements

Set the selected host's build root to `client/` and publish `dist/`. Application paths such as `/product/iphone-13` need fallback to `index.html` on direct requests. Existing assets must resolve normally; missing assets should not silently return HTML. Verify root/deep-link reloads, HTTPS, content types and cache behavior. No hosting provider is assumed or deployed by this task.

Images require access to `images.unsplash.com`. Bundled fixture data is public. Preserve prototype labels. Hosting this bundle does not activate authentication, contact, publication, analytics or persistence.

## Verification recorded for this audit

On 2026-09-22, `npm run build` passed with Vite 6.4.3 and 61 transformed modules using existing installed dependencies. The first sandboxed attempt failed because Vite/esbuild could not traverse a parent directory; a retry with the required filesystem access succeeded. No app/config workaround was needed.

This is build verification, not a fresh install, browser regression run, security audit or deployment. The former client README recorded earlier checks at six viewport widths; supporting artifacts were not present, so those are historical claims, not audit results. No automated test/lint scripts exist. See [audit](audit-report.md) for documentation checks.

## Production checklist — prototype hosting

- [ ] Select host/domain and document deploy/rollback ownership.
- [ ] Pin runtime and verify a clean lockfile installation in CI.
- [ ] Configure SPA fallback and test direct paths/reloads.
- [ ] Verify HTTPS, images/fallbacks, keyboard navigation and responsive layouts.
- [ ] Review caching/security headers and ensure no private data is bundled.
- [ ] Retain sample-data notices and smoke-test deployed output.

## Additional gates for a real marketplace pilot

- [ ] Select backend/auth/database/storage architecture and document actual configuration.
- [ ] Implement verified identity, ownership, visibility and server validation.
- [ ] Agree contact, location privacy, availability and moderation policies.
- [ ] Add versioned migrations, isolated demo seeds, tested recovery and rollback.
- [ ] Establish logs/error reporting, rate limits and privacy-reviewed measurement.
- [ ] Replace unsupported fixture reputation/stock signals or remove them.

Backend commands, database credentials, migrations and seeds are intentionally absent until implemented. The [database proposal](07-database-design.md) is design-only.
