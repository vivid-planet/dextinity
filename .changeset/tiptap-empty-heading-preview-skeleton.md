---
"@dextinity/site-react": patch
---

Treat a document with only empty headings as empty in `hasTipTapRichTextContent`

An empty heading renders nothing, just like an empty paragraph, so a heading-only TipTap rich text block now shows the preview skeleton while it has no text.
