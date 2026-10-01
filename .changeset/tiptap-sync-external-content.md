---
"@dextinity/cms-admin": patch
---

Apply content changes from outside to the TipTap rich text block's editor

`useEditor` only applies its `content` option once, so content set from outside the editor — for instance by an agent rewriting the text — was ignored while the editor was mounted. It is now synced into the editor, keeping the caret where it was. Content the editor emitted itself is skipped, so typing is unaffected.
