---
"@dextinity/site-react": patch
---

Render a newline within a TipTap text as a line break in `renderTipTapRichText`

Content migrated from DraftJS before `@dextinity/cms-api` converted soft line breaks to `hardBreak` nodes keeps them as newlines within the text. Without `white-space: pre-line` on the text, the browser rendered them as spaces.
