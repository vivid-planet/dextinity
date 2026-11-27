---
"@dextinity/cms-admin": patch
---

Keep non-breaking spaces in `createTipTapRichTextBlock` when copying and pasting, and show typed ones in the editor

Previously, a non-breaking space inserted with the toolbar button turned into a regular space when it was pasted in Chrome, and was dropped when it was copied as plain text.
A non-breaking space typed directly (e.g., with <kbd>Alt</kbd>+<kbd>0160</kbd>) or pasted from another application was saved correctly, but wasn't marked in the editor.
It is now converted into the same non-breaking space the toolbar button inserts.
