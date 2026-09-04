---
"@dextinity/cms-api": patch
---

Fix DAM file URLs (both inline "open in new tab" and download links) missing the file extension, which caused browsers to save downloaded files without their extension (e.g. `.pdf`). Downloads now also include the original filename via the `Content-Disposition` header.
