---
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: fill in a missing text block style with the `defaultStyle` when reading the block

Content written before a `defaultStyle` was configured carries no style, so the site had to render a missing style like the default. The API now applies the `defaultStyle` of the text block, or inside a list item of the list, whenever it reads a text block without a style. The site always receives the style's name, and the content needs no migration.
