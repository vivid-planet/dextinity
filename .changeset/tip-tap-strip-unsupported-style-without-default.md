---
"@dextinity/cms-admin": patch
---

Fix the TipTap rich text block keeping a text block style the new text block doesn't offer when no `defaultStyle` is configured

Changing a styled paragraph to a heading, e.g. with the `Mod-Alt-1` shortcut, kept the paragraph's style, so the API rejected the content and the block couldn't be saved.
