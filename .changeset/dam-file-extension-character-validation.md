---
"@dextinity/cms-api": patch
---

Reject DAM file uploads and renames whose extension contains characters outside `[a-zA-Z0-9]`

The file extension was never validated against a character allowlist, only the base filename was slugified. An extension containing a URL delimiter (e.g. `?` or `#`) would break the HMAC-signed DAM file URL for that file once served under it.
