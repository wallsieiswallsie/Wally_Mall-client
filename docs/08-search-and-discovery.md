# Search and discovery

[Database](07-database-design.md) · [KPIs](12-analytics-and-kpis.md) · [API](09-api-design.md)

## Goals

Help buyers find relevant available local supply even when merchant wording differs. Make store identity, category structure and geographic scope useful without implying physical proximity or real availability that the data cannot prove. Start with deterministic retrieval and judged examples; AI is not a requirement for the MVP.

## Current implementation

[Search.jsx](../client/src/pages/Search.jsx) lowercases the query, splits on whitespace, drops empty tokens, and requires **every token** to occur as a substring of concatenated fields. It does not require a phrase to appear contiguously or in the same field.

| Search surface | Indexed fields in current browser computation |
| --- | --- |
| Products | Product name, tags, seller name, category display name, subcategory |
| Stores | Store name, store category text, all associated fixture product names/tags |

Descriptions and geographic text are not query-matched. There is no Unicode/accent normalization, synonym engine, stemming, typo tolerance, backend index, or relevance score. Store results always use the global fixture collection. Category/store pages pass a constrained product source to `Listing` with store tabs disabled.

Product filters use category equality, seller-location equality, product-rating thresholds 4.8/4.9, and prices below 100,000 / 100,000 through 500,000 inclusive / above 500,000 IDR. Missing ratings fail a minimum-rating filter. Store results do not use these product filters. “Relevan” preserves fixture order; “Terbaru” reverses the filtered array; price sorts are numeric. No timestamps establish freshness. The Home “Baru di Wally” section instead uses the first five fixtures.

Suggestions use fixed strings and a special `sep` prefix branch. “Popular” terms are constants. “Recent” initializes to Sneakers/Croissant and can be cleared locally; submitted queries are never appended. These are UI examples, not behavioral analytics.

### Current vocabulary example

`hp` and `handphone` find the iPhone fixture because those terms are already tags (and Handphone is its subcategory). `smartphone` returns no fixture results. Substring matching can also broaden matches unexpectedly: `phone` matches both the iPhone and headphone listings. This distinction is a reason to evaluate token-aware retrieval, not to describe aliases as implemented.

## Proposed deterministic retrieval pipeline

1. Validate query length, filter values, pagination and region on the server. Preserve the original query for display; do not interpolate it into SQL.
2. Apply a versioned normalization function equally to queries and projected catalog text: Unicode normalization, lowercase, trim/collapse whitespace, a tested punctuation policy, and optional accent folding. Keep model numbers and meaningful digits. Do not indiscriminately remove short words such as `hp`.
3. Limit candidates to active products, active stores, active category ancestry and the agreed pilot region. Availability policy must be confirmed; proposed default excludes zero-stock products from ordinary discovery.
4. Retrieve exact name/token matches and full-text candidates. Only use bounded prefix/substring and typo fallback where exact candidates are insufficient.
5. Rank candidates, apply the selected explicit sort, and paginate stably. Return match context and filter state so zero results can be explained.

### PostgreSQL V1

Store normalized catalog text and a `tsvector` in a rebuildable product projection. Use an explicitly selected text-search configuration consistently for document and query construction. A `simple` configuration is a candidate starting point for mixed Indonesian terms and brand names; validate token behavior rather than assuming English stemming suits the catalog. GIN supports retrieval on a `tsvector`. See [PostgreSQL full-text index documentation](https://www.postgresql.org/docs/current/textsearch-indexes.html).

`unaccent` can remove diacritics where the chosen normalization policy calls for it. Keep the function/configuration version consistent between indexed documents and queries and rebuild after policy changes. See [PostgreSQL unaccent documentation](https://www.postgresql.org/docs/current/unaccent.html).

Use `pg_trgm` selectively for name similarity or indexed `ILIKE` candidate retrieval. Short patterns may offer few usable trigrams, so two-letter queries need an exact-token/alias path rather than an unrestricted fuzzy scan. Measure false positives and query plans before setting similarity thresholds. See [PostgreSQL pg_trgm documentation](https://www.postgresql.org/docs/current/pgtrgm.html).

Illustrative index shapes only, not a migration:

```sql
CREATE INDEX product_search_vector_idx
  ON product_search_documents USING GIN (search_vector);
-- Requires pg_trgm to be provisioned by the eventual migration workflow.
CREATE INDEX product_search_name_trgm_idx
  ON product_search_documents USING GIN (normalized_name gin_trgm_ops);
```

For fallback `ILIKE`, bind an escaped pattern as a parameter, escape wildcard characters when literal matching is intended, cap query/result sizes and time, and avoid broad scans for empty input. Do not concatenate raw input into SQL. Blank queries are bounded browsing, not a fuzzy search of every row.

### Aliases and synonyms — V2

Map reviewed aliases to canonical concepts. An illustrative concept is `handphone` with `hp`, `smartphone`, and `ponsel`; these are documentation examples, not automatically approved vocabulary. Preserve the original token and OR its approved equivalents within that token group, while AND-ing other query groups. Thus `hp bekas` should not turn into an OR across all words and return every used item.

Use token/phrase boundaries and longest approved phrase matching, avoiding replacements inside brand names or unrelated words. Ambiguous `hp` can refer to a phone abbreviation or the HP brand; category context and explicit original matches should prevent unconditional rewriting. Limit expansion count, avoid cycles, version the dictionary, and review zero-result terms before adding mappings. A scoped language/vocabulary key can support regional terms later without pretending a validated local lexicon exists today.

### Category, tag, store and geography matching

Derive category ancestry so a leaf item can be found from its parent concept. Tags express seller terms but are bounded and deduplicated to reduce spam. Store-name matches should make that store discoverable and can contribute to its products' matches; make the distinction visible in results. Do not synthesize reviews or popularity from fixture ratings.

Use canonical city/district values from the store's primary public location. Initially Sorong is a coverage constraint, not a distance ranking. No GPS collection or radius search is needed for V1. The current four filter areas versus six form areas must be reconciled before real coverage promises.

## Proposed MVP ranking

Start with an ordinal hypothesis: exact normalized product name → product-name token/prefix match → reviewed alias name match (V2) → category match → tag match → description match. Store-name intent should rank matching stores directly. Within a tier, prefer stronger term coverage, then an agreed freshness signal and stable ID tie-breaker. Avoid arbitrary fixed numeric weights until judged queries establish a baseline. Explicit low/high price or newest sorting should override relevance ordering with a deterministic tie-breaker.

Do not reward repeating tags. New listings should have a reasonable chance without fabricated popularity signals. Paid placement, if ever introduced, requires separate labeling and evaluation rather than silently changing organic relevance.

## Evaluation and operations — planned

Build a small human-judged query set from consenting buyer tasks. Include `hp`, `handphone`, `smartphone`, `hp bekas`, a misspelling, multiword category terms, store names, punctuation/model numbers, empty input, unavailable items and out-of-scope locations. Check relevant results, unwanted substring matches, exact versus fuzzy precision, and whether filters cause zero results. Record index freshness failures as well as latency. Reindex after product, tag, store or category changes; authoritative visibility checks must remain effective during rebuilds.

Track zero-result rate, result click-through, search-to-contact attempts and query latency by cohort without claiming a click proves a sale. Use the [measurement plan](12-analytics-and-kpis.md) for privacy and attribution.

## Evolution gates

| Version | Proposed scope | Gate |
| --- | --- | --- |
| V1 | Normalized keywords, relational filtering, PostgreSQL full text and bounded trigram fallback | Real catalog and judged baseline |
| V2 | Reviewed alias/synonym expansion | Evidence of vocabulary-driven misses |
| V3 | Behavioral ranking | Sufficient reliable, privacy-reviewed events and bias evaluation |
| V4 | Semantic retrieval experiment | Persistent unmet relevance needs and marketplace scale justify cost/complexity |

Elasticsearch or a vector service is not selected. Revisit only after measured relational-search limits, operational capacity and expected relevance gains justify another system.
