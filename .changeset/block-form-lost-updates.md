---
"@dextinity/cms-admin": patch
---

Prevent lost updates when several forms in a block change before the next render

`createFinalFormBlock` resolved each update against the field value of the render that created the handler.
When two forms in the block saved one after the other before the next render, for instance after a text edit and a link type change in a `createTextLinkBlock`, the second update overwrote the first one, and both changes could be lost.
The preview image of `createDamVideoBlock`, `YouTubeVideoBlock` and `VimeoVideoBlock` had the same problem together with the video options form.
