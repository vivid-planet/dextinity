---
"@dextinity/cms-api": patch
---

Find page tree nodes by name in the full-text search

The name and slug of a page tree node were only indexed when the node was updated, so new nodes couldn't be found by their name. Nodes without an indexed document, such as links, were missing from the search entirely. Both are now found by name. Existing nodes don't need to be saved again.
