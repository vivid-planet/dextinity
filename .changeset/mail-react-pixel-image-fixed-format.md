---
"@dextinity/mail-react": patch
---

Request pixel images in a fixed format instead of WebP

`MjmlPixelImageBlock` and `HtmlPixelImageBlock` add `negotiateFormat=false` to the image URL. Otherwise, the API serves WebP to clients that accept it, and a CDN that ignores `Vary` can serve a cached WebP image to classic Outlook for Windows, which can't display WebP.
