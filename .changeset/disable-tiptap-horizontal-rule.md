---
"@dextinity/cms-api": patch
"@dextinity/cms-admin": patch
---

TipTap Rich Text Block: disable the horizontal rule

The schema contained StarterKit's `horizontalRule` node, so the editor inserted one when typing `---`, `___ ` or `*** ` at the start of a text block. Neither the site nor the mail renderer renders it, so it silently disappeared on the site. The API now rejects content containing a `horizontalRule`, and the editor no longer creates one.

Remove horizontal rules from existing content before saving it again, as saving fails otherwise.
