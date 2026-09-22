---
"@dextinity/admin": patch
---

Restore the search field's `searchbox` role in `GridToolbarQuickFilter`

The role, id and blur handling that MUI's `QuickFilterControl` supplies were dropped, leaving the placeholder as the only way to address the field — for assistive technology as well as for end-to-end tests.
