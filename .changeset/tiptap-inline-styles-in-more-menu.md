---
"@dextinity/cms-admin": patch
---

Move custom TipTap inline styles into the toolbar's "More options" menu

Custom `inlineStyles` (e.g. a project-specific "Uppercase" style) used to render as their own always-visible dropdown in the rich text toolbar. They now appear as toggleable menu items inside the "More options" ("...") menu, next to Superscript/Subscript, matching how the previous Draft.js-based rich text editor exposed custom inline styles as toolbar toggles rather than a separate dropdown.
