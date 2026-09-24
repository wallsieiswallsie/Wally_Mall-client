# Security and privacy

[Authentication](10-authentication-and-authorization.md) · [Architecture](06-system-architecture.md) · [Deployment](14-deployment.md)

This is a code-based control inventory and implementation backlog, not a penetration test or compliance certification. The app is a public frontend prototype. Absent backend attack surfaces are not implemented backend protections.

## Current controls and gaps

| Area | Observed implementation | TODO before real service |
| --- | --- | --- |
| Password handling | Masked form input; no transmission, hashing or account storage | Select identity architecture; if first-party, use a maintained password-hashing library and reviewed password/recovery policy |
| JWT/session management | None | Define verified sessions, expiry, logout/revocation and suspended-account behavior |
| Access control | All routes public; seller role is UI intent | Server authentication, ownership-scoped reads/writes, denial tests for cross-owner IDs |
| Input validation | HTML required/length/range constraints and local tag limits | Server schemas, canonical IDs/categories, length/range limits, reject privileged payload fields |
| File uploads | No upload service; sample image picker only | If introduced: authenticated uploads, size/type/content validation, safe storage and asset ownership checks |
| Rate limiting | None in app | Protect identity, recovery, search, uploads and public contact exposure using measured limits |
| SQL injection | No SQL/database currently | Parameterized queries and least-privilege DB identity; never interpolate raw search or sort expressions |
| XSS | Dynamic text rendered through JSX; no unsafe HTML insertion found | Preserve escaping, validate future URLs, assess CSP for actual deployed resources |
| CSRF | No authenticated server mutations/cookies | If cookie sessions are selected, implement appropriate CSRF token/origin checks and cookie attributes |
| Sensitive data | Form values can exist in browser memory; no accounts created | Minimize collection, use secure transport and public/private response allowlists, define retention/deletion |
| Location privacy | Broad sample areas; onboarding accepts area/landmark | Seller-approved public granularity; home address/coordinates private by default |
| Audit logging | None | Record identity, ownership and publication changes with actor/resource/time; exclude credentials and unnecessary PII |
| Dependency assurance | Lockfile exists; no automated security scan configured | Establish updates/scanning; build success is not a vulnerability assessment |

These TODOs do not imply that a particular library, policy or provider was selected.

## External resources and browser data

Illustrations load from Unsplash, so the browser contacts that host despite the absence of an application API. Review image permissions, referrer policy and hosting/security headers for real deployment. Some Home images lack the product-card error fallback. Clipboard sharing uses the current URL and catches failures; secure hosting is needed for dependable modern browser capabilities.

There is no application localStorage/sessionStorage persistence, but browser autofill and browsing history are independent. Continue asking prototype users for invented form values. Keep secrets out of fixtures, static bundles and frontend configuration.

## Proposed trust boundaries

Treat browser identity, role, owner IDs, price/stock and publication requests as untrusted. Authenticate and authorize every server mutation, including nested assets. Public responses should expose only eligible catalog data and seller-approved contact/location fields. Keep credentials and service secrets exclusively on the backend when it exists.

Validate future contact targets against the selected channel policy; disallow executable URL schemes. Public contact information can attract scraping and unwanted messages, so confirm seller consent and design abuse controls with the actual channel.

## Pre-pilot verification

Test anonymous writes, other sellers' IDs, disabled accounts/stores, inactive deep links, invalid query/filter values, duplicate identifiers, asset ownership if uploads exist, session revocation and recovery. Confirm backup restoration and absence of sensitive fields in public responses/logs. Define analytics access and retention before collecting real behavior. These backend checks cannot be executed against the current frontend-only application.
