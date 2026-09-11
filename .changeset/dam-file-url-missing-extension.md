---
"@dextinity/cms-api": patch
---

Fix DAM file URLs (both inline "open in new tab" and download links) missing the file extension, which caused browsers to save downloaded files without their extension (e.g. `.pdf`).

Requests for a DAM file URL whose filename segment no longer matches the file (for instance, a URL generated before this fix) now get a permanent redirect to the current canonical URL instead of being served under the stale filename.
