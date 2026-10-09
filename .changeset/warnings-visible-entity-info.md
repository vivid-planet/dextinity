---
"@dextinity/cms-api": minor
---

Add `visible` to `EntityInfo` and support filtering and sorting warnings by it

The `EntityInfo` GraphQL type now exposes the entity's visibility (e.g., whether a page is published).
The `warnings` query accepts a `visible` filter and sort field, resolved via the joined `EntityInfo`.
Warnings of entities without an `EntityInfo` are treated as visible.
