---
"@dextinity/cms-admin": minor
---

Export `PageEditorHeader` and `usePageEditorHeader`

Editors of documents that don't consist of blocks, e.g. a form editing a predefined page, can show the same compact header as `PageContentEditor`: back to the page tree, the kind of document and scope, the page's name, status and path, the save state, "More actions" and "Save".
`usePageEditorHeader(pageId)` returns the header's props describing the page and a function to open the page's site preview.

```tsx
const { headerProps, openSitePreview } = usePageEditorHeader(pageTreeNodeId);

<PageEditorHeader {...headerProps} saveState={saveState} hasChanges={hasChanges} saving={submitting} onSave={save} />;
```
