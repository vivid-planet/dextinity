---
"@dextinity/cms-api": minor
---

Add `PageTreeService#getSlugAvailability` and export the page tree config

`getSlugAvailability` answers whether a slug is available, taken or reserved under a parent node, as the `pageTreeNodeSlugAvailable` query does, so code outside the GraphQL resolver, for instance an MCP tool, can check a slug the same way. Its result is the newly exported `PageTreeSlugAvailability` enum.

The config of the `PageTreeModule` can be injected with the exported `PAGE_TREE_CONFIG` token and typed with `PageTreeConfig`, for instance to check `allowPageDelete` before deleting a page tree node.
