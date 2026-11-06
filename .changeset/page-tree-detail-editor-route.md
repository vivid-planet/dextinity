---
"@dextinity/cms-admin": major
---

Host the page editor in `PageTreeDetailPage` instead of delegating to `PagesPage`

The editor of a page's document type opens at `<page tree url>/<pageId>/edit` as before. Going back from it selects the page in the tree.
Editors can read the edited page, its document type and the URL back to the tree with `usePageEditorContext`.

**Breaking changes**

- `PageTreeDetailPage` only handles `/:pageId/edit`. Other stack page names below a page, which `PagesPage` resolved, no longer open anything.
- Pages that don't exist or are archived show an `EmptyState` or a `Banner` of `@dextinity/ui` instead of an MUI `Alert`.
- `renderContentScopeIndicator` of `PageTreeDetailPage` is optional and deprecated, as it is no longer used.

`PagesPage` is unchanged.
