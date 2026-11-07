---
"@dextinity/cms-admin": minor
---

Let the block preview show no address

`siteUrl` of `BlockPreviewPane` and of the `preview` of `BlockContentEditor` tabs now also accepts `null`, which hides the address above the preview.
Use it for content without a page of its own, e.g. an email. Without `siteUrl`, the preview keeps showing the address of the block preview page.
