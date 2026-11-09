---
"@dextinity/cms-admin": minor
---

Add `PageTreeDetailPage` built on `@dextinity/ui`

The page tree as a tree with the detail of the selected page next to it: search and filter by status, expand and collapse, select pages for bulk publishing, unpublishing or archiving, and move pages by dragging. Each change can be undone from a toast. Double-click a page, or press Enter on it, to edit its content; a single click shows its detail. Editing a page's content still opens the editor of `PagesPage`.

```tsx
<PageTreeDetailPage
    path={`/pages/pagetree/${match.params.category}`}
    category={category}
    documentTypes={documentTypes}
    editPageNode={EditPageNode}
    renderContentScopeIndicator={(scope) => <ContentScopeIndicator scope={scope} />}
/>
```
