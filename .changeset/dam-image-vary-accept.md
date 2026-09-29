---
"@dextinity/cms-api": patch
---

Send `Vary: Accept` in DAM image responses

The image format depends on the `Accept` header. Without `Vary`, a CDN could send a cached WebP image to a client that does not support WebP. For example, images in emails could fail to load in classic Outlook for Windows.

Some CDNs ignore `Vary` by default. Check if your CDN needs a setting to cache each image format separately.
