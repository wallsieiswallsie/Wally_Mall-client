# Contributing to Wally Mall

Start with the [product overview](docs/00-product-overview.md) and [audit](docs/audit-report.md). Keep Sorong discovery, local supply density, seller visibility, and search quality central to changes.

## Local setup

From this repository root, run `npm ci`, then `npm run dev`. Configure the API using this repository's README. Run `npm run build:all` for all frontend builds. Independent apps use `dev:buyer`, `dev:seller` and `dev:admin`. See the [deployment guide](docs/live-deployment.md) for environment and deployment requirements.

## Branches and commits

No project-specific branch or commit convention was found. Suggested lightweight convention: `codex/<short-topic>` for agent work, descriptive topic branches for other work, and concise imperative commits such as `Document seller preview limitations`. Conventional Commits are optional, not an established requirement.

Client and server are separate Git repositories. Check `git rev-parse --show-toplevel` and `git status --short` before staging, preserve existing edits, and prepare separate commits for each repository.

## Code and data conventions

Follow existing JavaScript ES modules, JSX function components and React hooks. Role routes and pages belong in `apps/<role>/src`; genuinely shared app code belongs in `packages/shared`, base UI in `packages/ui`, and API/environment handling in `packages/api-client`. Shared packages must not import applications. Keep Indonesian UI copy consistent and reuse existing theme tokens and components.

Preserve explicit sample-data labels. Fixture products must reference valid seller/category slugs and valid subcategories. Do not present sample ratings, badges, or dashboard counts as real performance. Never commit real credentials, merchant personal data, or unlicensed images.

## Validation and pull requests

Describe the user problem, changed behavior, affected routes, and verification. Run `npm test`, `npm run test:render`, `npm run test:structure` and `npm run build:all`. For visible changes, check mobile/desktop, keyboard navigation, empty states and refresh behavior. The optional browser fixture runner is `npm run test:browser` (requires Playwright and an installed browser). Backend tests run separately in `server/`. There is no lint/typecheck script; do not claim one passed.

Keep business hypotheses distinct from evidence. Update relevant documentation when behavior, routes, environment variables, or scripts change. Include screenshots for material visual changes when useful, and disclose checks that could not run. Avoid unrelated refactors.

## Database and migration workflow

Database migrations and seeds belong to the separate [server repository](https://github.com/wallsieiswallsie/Wally_Mall-server), using Knex and PostgreSQL. Follow its integration/deployment guide and test against a fresh disposable TEST_DATABASE_URL. Client prototype state is local demo data and does not apply server migrations. Never execute proposed documentation SQL against production.
