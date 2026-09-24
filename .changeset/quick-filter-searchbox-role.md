---
"@dextinity/admin": patch
---

Restore the search field's `searchbox` role in `GridToolbarQuickFilter`

The role and id that MUI's `QuickFilterControl` supplies for the input element were dropped, leaving the placeholder as the only way to address the field — for assistive technology as well as for end-to-end tests.
