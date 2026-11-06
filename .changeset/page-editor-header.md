---
"@dextinity/cms-admin": minor
---

Export `PageEditorHeader` and `getContentScopeLabel`

Editors of documents that don't consist of blocks, e.g. a form editing a predefined page, can show the same compact header as `PageContentEditor`: back to the page tree, the kind of document and scope, the page's name, status and path, the save state, "More actions" and "Save".
`getContentScopeLabel` builds the readable label of a scope, e.g. "Main / English", for such a header.
