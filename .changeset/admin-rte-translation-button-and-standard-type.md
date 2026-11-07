---
"@dextinity/admin-rte": minor
---

Add the `overwriteTranslationButton` option and show unstyled blocks as the standard block type

`overwriteTranslationButton` replaces the toolbar button that translates the content, like `overwriteLinkButton` does for links.

With a `standardBlockType` other than `unstyled`, the block type select was empty for unstyled blocks, e.g. a new, empty paragraph. It now shows the standard block type, which takes the place of "unstyled".
