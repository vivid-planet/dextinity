---
"@dextinity/cms-api": patch
---

Add a `Content-Disposition: inline` header with the file name to DAM file endpoints

The endpoints serving a file for display previously sent no `Content-Disposition` header at all, so browsers derived the name from the URL when saving the file. They now send `inline` together with the file name, which keeps the file being displayed instead of downloaded.
