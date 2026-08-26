---
"@dextinity/mail-react": patch
---

Round images in classic Outlook

`borderRadius` on `MjmlImage`, `HtmlImage`, `MjmlPixelImageBlock` and `HtmlPixelImageBlock` now also rounds the image in classic Outlook.

Classic Outlook rounds the image only when `width` and `height` are given in pixels, and the radius is given in pixels or as `"50%"`. In every other case the image stays square in that client.
