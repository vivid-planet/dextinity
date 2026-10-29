---
"@dextinity/cms-api": patch
---

Fix combining multiple fields in a `RedirectFilter`

A filter like `{ sourceType: { equal: "domain" }, active: { equal: true } }` only applied its last field, so `paginatedRedirects` also returned redirects that didn't match the other fields. All fields of a filter now have to match.
