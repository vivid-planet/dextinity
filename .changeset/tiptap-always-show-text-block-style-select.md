---
"@dextinity/cms-admin": minor
---

Keep the text block style select of `createTipTapRichTextBlock` in the toolbar where the selected node has no styles

Previously, the toolbar hid the select where the selected node had no styles, for instance in a list without styles, and the toolbar buttons to its right moved to the left.
Now the select stays in the toolbar and is disabled there.
Blocks without any text block styles still show no select.
