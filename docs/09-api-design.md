# API design

[Database proposal](07-database-design.md) · [Authentication](10-authentication-and-authorization.md) · [Rules](11-business-rules.md)

## Implementation status

**Implemented endpoints: none.** The frontend imports JavaScript fixtures and makes no application API requests. Browser routes such as `/product/:slug` are pages, not server endpoints. Image requests to Unsplash are external media requests.

Everything below is **Planned — proposed REST contract**, pending backend/auth decisions. Paths use a proposed `/api/v1` prefix to avoid conflicting with SPA routes. No mock server, backend package, or API environment variable has been added.

## Shared contract

Use JSON. Entity IDs are proposed UUIDs; slugs resolve public detail URLs. Public responses explicitly allowlist fields, omitting credentials, private addresses, and private contact data. Dates are ISO 8601 UTC. Prices are integer IDR, matching current display/form semantics. Collections return `{data: [...], page: {next_cursor: string|null}}`; a detail returns `{data: {...}}`. Proposed pagination defaults to 20 with a maximum of 50, subject to measurement. Cursors bind filters, sort, and a stable ID tie-breaker.

Errors return `{error: {code, message, fields?}, request_id}`. Planned statuses: 400 malformed query, 401 missing session, 403 disallowed role, 404 missing or non-owned resource (avoid confirming another owner's private resource), 409 identifier/state conflict, 422 invalid fields, and 429 throttled. Successful creates return 201, reads/updates 200, and deletes/logout 204. Never return stack traces or echo passwords.

**Authentication convention for this proposal:** server-validated session; concrete transport/provider remains unselected. “Seller owner” requires both seller capability and `store.owner_user_id === current_user.id` on the server. IDs/roles from a request body do not establish identity. Cookie-session requests, if selected, need the CSRF controls in [security](13-security-and-privacy.md).

## Resource representations

| Name | Proposed fields returned |
| --- | --- |
| User | `id, name, role, status`; own verified identifiers only on `/users/me` |
| StorePublic | `id, slug, name, description, primary_category_id, logo_url, banner_url, public_location` |
| LocationPublic | `public_area, district, city, province`; no precise address/coordinates by default |
| ProductPublic | `id, slug, store_id, category_id, name, description, price, currency, condition, stock_quantity, images, tags, published_at` |
| Category | `id, parent_id, slug, name, sort_order` |
| OwnerStore / OwnerProduct | Public fields plus owner's draft/active/inactive status and editable fields; private location/contact fields only to owner |
| ContactTarget | `channel, target`; validated destination chosen by contact policy, no message/order receipt |

Sample ratings and badges have no proposed real-data API field until their provenance is established.

## Identity and own-account endpoints — Planned

| Method / path (after `/api/v1`) | Auth / role | Request | Response | Business rule |
| --- | --- | --- | --- | --- |
| POST `/auth/register` | Public | `{name, identifier, password, intent: buyer|seller}` | 201 `{data: {user, verification_required: true}}` | Normalize unique identifier; establish verification; no arbitrary role/status grants |
| POST `/auth/login` | Public | `{identifier, password}` | 200 `{data: {user}}` plus session established by chosen transport | Verify credentials and account status; generic failure, throttling |
| POST `/auth/logout` | Session / buyer or seller | No body | 204 | Revoke current server session |
| GET `/users/me` | Session / buyer or seller | No body | 200 `{data: User}` | Only current identity; never accept target user ID |

These contracts do not settle verification delivery, password recovery, session persistence, or provider integration. Those are launch prerequisites to design after provider selection, not implemented endpoints hidden from this inventory.

## Public discovery — Planned

| Method / path | Auth / role | Request | Response | Business rule |
| --- | --- | --- | --- | --- |
| GET `/categories` | None / visitor | Optional `parent_id` | 200 category collection | Active taxonomy only |
| GET `/products` | None / visitor | `category_id, store_id, city, district, min_price, max_price, sort, cursor, limit` | 200 ProductPublic collection | Active eligible products/stores; bounded browsing; sort `newest|price_asc|price_desc` |
| GET `/products/by-slug/:slug` | None / visitor | Slug path only | 200 ProductPublic detail or 404 | Same visibility checks as listing; inactive item must not leak through deep link |
| GET `/stores` | None / visitor | `city, district, cursor, limit` | 200 StorePublic collection | Active stores in agreed scope |
| GET `/stores/by-slug/:slug` | None / visitor | Slug path only | 200 StorePublic detail or 404 | Public location and fields only |
| GET `/search` | None / visitor | `q, type=product|store`, applicable catalog filters, `sort, cursor, limit` | 200 `{data: [...], page, meta: {query, type, returned_count}}` | Same eligibility as browsing; validated type-specific filters; relevance default |
| GET `/stores/:id/contact` | None / visitor | Optional `product_id` | 200 `{data: ContactTarget}` | Only enabled public channel for active store; product must belong to it and be visible; throttle scraping |

Public product results contain enough store context or resolvable store IDs for cards. Category filtering includes descendants under a parent. Related products can use category/store filters excluding the current ID on the client for the initial small catalog; no recommendation endpoint is required yet. Current rating filters are intentionally not promised in the proposed API because real ratings have no source; either defer that UI control or design verified reputation first.

Contact-channel selection remains open. A WhatsApp link is a possible implementation, not a current capability. Retrieving or clicking a destination does not send a message or establish a sale. No contact event is inferred from GET alone.

## Seller catalog — Planned

| Method / path | Auth / role | Request | Response | Business rule |
| --- | --- | --- | --- | --- |
| GET `/users/me/stores` | Session / seller | `cursor, limit` | 200 OwnerStore collection | Scope by current user's ownership |
| POST `/stores` | Session / seller | `{name, description, primary_category_id, location: {public_area, district, city, province}, contact?}` | 201 OwnerStore | Owner from session; validate pilot coverage; create draft + primary location atomically |
| PATCH `/stores/:id` | Session / seller owner | Subset of writable store, primary location and selected contact fields | 200 OwnerStore | No owner transfer via payload; validate completeness on activation |
| GET `/stores/:id/products` | Session / seller owner | `status, cursor, limit` | 200 OwnerProduct collection | Owner may inspect drafts/inactive items |
| POST `/stores/:id/products` | Session / seller owner | `{name, category_id, description, price, condition, stock_quantity, tags, images?}` | 201 OwnerProduct | Server allocates ID/slug; draft by default; enforce field/tag constraints |
| PATCH `/products/:id` | Session / seller owner | Subset of editable product fields including requested `status` | 200 OwnerProduct | Check owner through product's store; validate allowed state change, taxonomy and store visibility |

Update endpoints are proposed to make a maintainable catalog; edit screens do not currently exist. Inactivation is supported in the proposal; hard deletion, upload signing and admin moderation are deferred until their policies are agreed. Image metadata is not arbitrary remote URL ingestion: eventual storage handling must issue trusted asset identifiers and validate ownership before publication.

## Favorites — Planned

| Method / path | Auth / role | Request | Response | Business rule |
| --- | --- | --- | --- | --- |
| GET `/users/me/favorites` | Session / buyer or seller | `cursor, limit` | 200 ProductPublic collection | Only own favorites; public visibility still applies |
| PUT `/users/me/favorites/:product_id` | Session / buyer or seller | No body | 200 `{data: {product_id, saved: true}}` | Idempotent; product must be visible when saved |
| DELETE `/users/me/favorites/:product_id` | Session / buyer or seller | No body | 204 | Idempotent removal, own user-product key only |

Current guest favorites remain a separate session-only experience until persistent-account behavior is selected.

## Example proposed request

```http
POST /api/v1/stores/{owned-store-id}/products
Content-Type: application/json

{"name":"Example canvas bag","category_id":"{leaf-category-id}","description":"Illustrative request only","price":85000,"condition":"new","stock_quantity":8,"tags":["tas","canvas"]}
```

Expected 201 response includes a server-generated UUID and unique slug, `status: "draft"`, the authorized store ID, and validated fields. The placeholders above are documentation placeholders, not executable production identifiers. Publication then requests `PATCH /products/:id` with `{"status":"active"}` and succeeds only after the publication policy is satisfied.

## Contract decisions still open

Select identity verification/recovery, session transport, publication approval, real contact channel, image handling, account deletion and analytics ingestion. There is no `/admin` API proposal presented as current functionality because no admin workflow exists. Define operational moderation before exposing a real seller catalog, using the smallest agreed workflow. Revisit contracts when those decisions are made and add integration tests for ownership, visibility, validation and pagination.
