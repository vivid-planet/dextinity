---
"@comet/cms-api": patch
---

Validate `damFileId` as UUID in `PixelImageBlock` and `SvgImageBlock`

Previously, any non-empty string was accepted and saved, resulting in a broken image.
