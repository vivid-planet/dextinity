---
"@dextinity/cms-api": patch
---

Add the file name to the `Content-Disposition` header of DAM file downloads

The header was previously set to `attachment` without a file name, so browsers derived the name of the downloaded file from the URL, which contains the file name without its extension.
