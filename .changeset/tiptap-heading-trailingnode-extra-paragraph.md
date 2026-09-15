---
"@dextinity/cms-admin": patch
---

Fix an empty paragraph appearing after switching a block to a heading

Turning the editor's only (or last) block into a heading via the text block type dropdown left an empty paragraph behind it. This came from TipTap's `TrailingNode` extension, which inserts an empty paragraph after the last block whenever that block isn't of the schema's default type, so a document never ends on a block with no direct way to place the cursor after it. A heading doesn't need that: pressing Enter at its end already creates a paragraph below it, unlike a non-text block such as an inserted child block.

`createTipTapRichTextBlock` now excludes headings from that check, so switching a block to a heading (and back) no longer adds or leaves behind an extra paragraph.
