---
"@dextinity/cms-api": patch
---

Enforce content-scope boundaries when attaching documents and nesting page tree nodes

`PageTreeService` now rejects cross-scope operations that the argument-level scope check didn't cover, because the relevant ids are nested inside input objects: attaching a document that already belongs to a node in a different scope (`attachDocument`, `createNode`, `updateNode`) and placing a node below a parent in a different scope (`createNode`, `updateNodePosition`).

Without these checks an editor restricted to one scope could read and overwrite documents of another scope, for instance by passing a foreign `pageId` to `savePage`, a foreign `attachedDocument.id` to `createPageTreeNode`/`updatePageTreeNode`, or a foreign `parentId` to `movePageTreeNodesByPos`.
