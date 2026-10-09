---
"@dextinity/mail-react": patch
---

Render a newline within a TipTap text as a line break

Content migrated from DraftJS before `@dextinity/cms-api` converted soft line breaks to `hardBreak` nodes keeps them as newlines within the text. The DraftJS renderer rendered these as line breaks, so the TipTap renderer now does too.
