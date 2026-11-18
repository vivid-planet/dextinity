---
"@dextinity/mail-react": patch
---

Request a valid image width for full-width pixel image blocks

`HtmlPixelImageBlock` and `MjmlPixelImageBlock` requested twice the width unrounded when `width` equaled `largestPossibleRenderWidth` (by default `theme.sizes.bodyWidth`), e.g. `1200`. The API's image route rejects widths that aren't in the allowed image sizes, so the image failed to load.
The blocks now always round to one of `validSizes`, and use `largestPossibleRenderWidth` when it is larger than `width`, as documented.
