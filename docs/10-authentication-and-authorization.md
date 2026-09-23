# Authentication and authorization

[API proposal](09-api-design.md) · [Security](13-security-and-privacy.md)

## Current behavior

[Auth.jsx](../client/src/pages/Auth.jsx) contains forms only. Password inputs are masked and have a six-character browser minimum; no password is hashed, verified, sent to a backend, or stored as an account. Login and buyer registration show notices. Seller registration navigates to onboarding without creating identity or session. The role selector expresses user intent only.

There is no JWT, cookie session, identity provider, authorization middleware, route guard, ownership enforcement, or admin role. `/seller/dashboard` and `/seller/products/new` can be opened by any visitor. This is intentional preview behavior, not acceptable authorization for a persistent service.

## Current permissions matrix

| Action | Any visitor | Buyer option | Seller option | Admin |
| --- | --- | --- | --- | --- |
| Browse/search/view | Yes | Same visitor access | Same visitor access | No role exists |
| Toggle session favorites | Yes | Same | Same | No role exists |
| Open seller setup/dashboard/product form | Yes, preview | Same | Same | No role exists |
| Create a real account/store/product | No | No | No | No |
| Edit/delete/moderate real listings | No | No | No | No |

## Proposed persistent-service permissions

This table is a design recommendation, not an implemented control. Sellers retain buyer capabilities.

| Action | Guest | Authenticated buyer | Authenticated seller |
| --- | --- | --- | --- |
| Browse/search public products/stores | Yes | Yes | Yes |
| Use selected public contact channel | Yes, subject to policy | Yes | Yes |
| Persist own favorites | No | Yes | Yes |
| Create store | No | Become seller first | Yes, within agreed store limit |
| View/edit store's private draft data | No | No | Owner only |
| Create/update a store product | No | No | Owner only |
| Modify another seller's records | No | No | No |
| Moderate marketplace/category taxonomy | No | No | No admin model selected |

## Ownership and session boundary — Planned

Authenticate on the server for every write. Derive user identity from a validated session, load product → store → owner for product operations, and filter all seller list/detail queries by that owner. Enforce checks for updates to nested image/tag/location resources too. Never trust a body `owner_user_id`, hidden field, URL slug, or browser role. Handle ownership check and write atomically to avoid races. Return a consistent missing-resource response for inaccessible private resources.

Choose first-party password authentication versus an identity provider before implementing the proposed account schema. A server-side session with a secure cookie is a candidate for this browser product; JWT is not presumed necessary. Define verification, expiry, revocation/logout, recovery and account suspension behavior before launch. The six-character demo constraint is not a production password-policy decision.

Admin access is deliberately unresolved. If publication requires moderation, define staff identity and least-privilege permissions separately; do not let public registration choose staff status.
