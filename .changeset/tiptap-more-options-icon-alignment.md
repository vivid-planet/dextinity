---
"@dextinity/cms-admin": patch
---

Move icons to the start of the TipTap "More options" menu items

Superscript, Subscript, and custom inline-style menu items placed their icon directly after the label using a custom flexbox layout, so the icon's horizontal position varied with the label's length. They now use MUI's `ListItemIcon`/`ListItemText` with the icon leading the label, matching MUI's own menu item convention.
