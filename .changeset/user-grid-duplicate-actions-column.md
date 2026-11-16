---
"@dextinity/cms-admin": patch
---

Fix duplicate `actions` columns in `UserPermissionsUserGrid`

The actions column was appended to the memoized column array in the render phase, so every re-render that did not invalidate the memo added another copy of it, causing React duplicate-key warnings.
