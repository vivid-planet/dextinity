---
"@dextinity/mail-react": patch
---

Fix rounded images rendering a pixel too large in classic Outlook

Two images side by side made their section wider than the body width. Affects `MjmlImage`, `HtmlImage`, `MjmlPixelImageBlock` and `HtmlPixelImageBlock`.
