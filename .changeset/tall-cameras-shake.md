---
"@dextinity/cms-api": patch
---

Batch page tree node lookups in `PageTreeReadApi` to avoid N+1 queries

`getNode()` issued one query per call. Since blocks are transformed concurrently, a page containing many internal links caused one query per link plus one per path segment, and concurrent lookups of the same node each ran their own query because the cache was only filled after a query resolved.

Node lookups are now batched into a single query per tick and deduplicated while in flight. The number of queries is bound by the depth of the page tree instead of the number of links: a page with 200 internal links pointing at nodes four levels deep drops from 801 queries (~550 ms) to 5 queries (~89 ms).
