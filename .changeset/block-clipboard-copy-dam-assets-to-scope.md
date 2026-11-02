---
"@dextinity/cms-admin": patch
---

Copy referenced DAM assets to the target scope when pasting blocks

Previously, only pasting pages in the page tree copied the referenced DAM assets. Blocks pasted into another scope kept referencing the assets of the source scope, so deleting an asset in the source scope broke the page it was pasted into.

Pasting blocks now behaves like pasting pages: assets that don't live in the target DAM scope are copied into an inbox folder of the target scope (reusing an existing copy if there is one) and the pasted blocks reference the copies. Pasting within the same scope is unchanged.

Like when pasting pages, dependencies that can't be carried over to another scope are removed when pasting blocks into another content scope, e.g., links to pages of the source scope.
