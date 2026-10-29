---
"@dextinity/cms-admin": patch
---

Keep the focus in the child block dialog of `createTipTapRichTextBlock`

Choosing a child block from the toolbar's "Insert block" menu refocused the editor shortly after the dialog had opened, which moved the focus away from the dialog's fields, for instance from a field with `autoFocus`.
