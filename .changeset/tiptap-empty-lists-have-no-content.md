---
"@dextinity/site-react": patch
---

Treat a document with only empty lists as empty in `hasTipTapRichTextContent`

An empty list renders nothing but a bullet or a number, so a TipTap rich text that contains only empty lists, list items and text blocks no longer counts as content.
