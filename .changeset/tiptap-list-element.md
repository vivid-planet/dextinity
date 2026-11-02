---
"@dextinity/cms-admin": patch
---

Render list items in `createTipTapRichTextBlock` through the list's `element`

The editor ignored the `element` of `orderedList` and `unorderedList`. A list item was rendered through the style its text block kept from before it was turned into a list item, or as a plain `p` without a style.
A text block in a list item is now rendered through the list's style, then the list's `element`, then the text block's style, then the text block's `element`.
