---
"@dextinity/cms-api": patch
---

Fix the error after uploading files to the DAM when the asset list isn't sorted

When no sort column was selected in the asset list, `damItemListPosition` failed with an SQL error such as `column folder.undefined does not exist`, and the admin showed this error after every upload.
`damItemsList` and `damItemListPosition` now sort by `name` when no sort column is given.
