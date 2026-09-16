---
"@dextinity/cms-api": patch
---

Batch child node lookups in `PageTreeReadApi` to avoid N+1 queries

Walking the page tree — rendering a menu, resolving a path segment by segment, or calling `getDescendants()` — issued one query per node to load its children.

Lookups of the form "children of node X" are now batched into a single query per scope and tick, and `getDescendants()` descends into all children of a level at once instead of one after another. Resolving a three-level menu across 200 root nodes drops from 612 queries (~609 ms) to 4 queries (~119 ms).
