---
"@dextinity/cms-api": minor
---

Add `negotiateFormat` query parameter to DAM image URLs

By default, the API serves WebP to clients that offer `image/webp` in their `Accept` header. With `?negotiateFormat=false`, the format depends only on the source file: JPEG, PNG, and GIF files keep their format, and all other files are converted to JPEG. The response then doesn't send `Vary: Accept`, so a CDN that ignores `Vary` can't serve a cached WebP image instead.

Use it for images in emails: classic Outlook for Windows can't display WebP.
