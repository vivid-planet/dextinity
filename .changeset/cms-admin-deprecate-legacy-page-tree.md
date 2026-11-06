---
"@dextinity/cms-admin": minor
---

Deprecate the page tree and page editor components built with MUI

`PagesPage`, `BlockPreviewWithTabs`, `SplitPreview`, `BlockPreview` and `BlockAdminTabs` keep working, but their successors are built with `@dextinity/ui`: `PageTreeDetailPage` for the page tree, `PageContentEditor` for the editors of the document types, and `BlockPreviewPane` for the preview next to other editors. The migration guide to v11 shows how to move an editor.
