# Contributing to Wally Mall

Start with the [product overview](docs/00-product-overview.md) and [audit](docs/audit-report.md). Keep Sorong discovery, local supply density, seller visibility, and search quality central to changes.

## Local setup

From this directory, run `cd client`, `npm ci`, then `npm run dev`. Use `npm run build` for the existing compile check and `npm run preview` to inspect the output. No environment variables, database setup, or seeds are required. The audit environment uses Node 22.14.0 / npm 10.9.2; the repository has no pinned runtime policy.

## Branches and commits

No project-specific branch or commit convention was found. Suggested lightweight convention: `codex/<short-topic>` for agent work, descriptive topic branches for other work, and concise imperative commits such as `Document seller preview limitations`. Conventional Commits are optional, not an established requirement.

The audited checkout sits inside a larger parent Git repository. Check `git rev-parse --show-toplevel` and `git status --short` before staging. Scope changes to Wally Mall and avoid staging sibling projects. Do not assume this folder is an independent Git root.

## Code and data conventions

Follow existing JavaScript ES modules, JSX function components, double quotes, semicolons, and React hooks. Shared UI belongs in `src/components`, route screens in `src/pages`, and routes in `src/routes/AppRoutes.jsx`. Keep Indonesian UI copy consistent; documentation uses English with existing Indonesian product terms where helpful. Reuse theme tokens and existing UI components.

Preserve explicit sample-data labels. Fixture products must reference valid seller/category slugs and valid subcategories. Do not present sample ratings, badges, or dashboard counts as real performance. Never commit real credentials, merchant personal data, or unlicensed images.

## Validation and pull requests

Describe the user problem, changed behavior, affected routes, and verification. Run the build for code changes. For visible changes, check affected screens on mobile and desktop, keyboard navigation, empty states, and refresh behavior. For documentation-only changes, check source claims, local links, diagrams, and the Current/Planned boundary. No automated test or lint command exists; do not claim one passed.

Keep business hypotheses distinct from evidence. Update relevant documentation when behavior, routes, environment variables, or scripts change. Include screenshots for material visual changes when useful, and disclose checks that could not run. Avoid unrelated refactors.

## Database and migration workflow

There is no database, ORM, migration runner, or seed command today. [Database design](docs/07-database-design.md) is a proposal, not a migration. Before introducing persistence, select a backend and migration tool, confirm constraints and contact/privacy policies, and review versioned migrations against a disposable development database. Document actual commands only when they exist. Test upgrade and recovery behavior before any production application. Do not execute documentation SQL against a production database.
