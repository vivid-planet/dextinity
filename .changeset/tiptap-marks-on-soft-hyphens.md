---
"@dextinity/cms-admin": patch
"@dextinity/cms-api": patch
---

Keep bold, italic and links on soft hyphens and non-breaking spaces in TipTap rich texts

`migrateFromDraftJs` and the editor's soft hyphen and non-breaking space buttons created these nodes without the marks of the surrounding text.
On the site, a soft hyphen in a bold word was rendered outside the `<strong>`, so the hyphen at a line break was thinner than the letters around it, and a link containing one was split into two links.
