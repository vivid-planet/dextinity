---
"@dextinity/cms-api": patch
---

Replace the `hasha` dependency with Node's built-in `crypto`

`hasha` isn't needed — Node's `crypto` covers everything we use it for. Hashing now uses `crypto` directly, producing identical hex-encoded MD5 hashes, so existing `contentHash` values and scaled-image cache paths remain valid.
