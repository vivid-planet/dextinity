---
"@dextinity/cms-admin": patch
---

Keep the target of links and the data of child blocks when copying and pasting in `createTipTapRichTextBlock`

The editor wrote the data of links and child blocks into the clipboard as `[object Object]`, so a pasted link had no target and a pasted child block lost its content.
Saving a rich text with such a link failed.
