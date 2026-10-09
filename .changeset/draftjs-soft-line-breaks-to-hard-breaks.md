---
"@dextinity/cms-api": patch
---

Convert a soft line break in DraftJS content to a `hardBreak` node when migrating to TipTap

DraftJS stores a soft line break (Shift+Enter) as a newline within the block's text. The migration kept it as a newline in a TipTap text node, which the rich text renderers don't render as a line break.
