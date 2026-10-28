---
"@dextinity/admin": patch
---

Add the selected files up to `maxFiles` in `FileSelect` and `FinalFormFileSelect`

When more files are selected than `maxFiles` allows, the files up to the limit are added and only the remaining files are shown as rejected.
Before, none of the selected files were added.
The same applies when several files are selected in a single-file `FileSelect`: the first file is added.
