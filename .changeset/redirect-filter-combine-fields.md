---
"@dextinity/cms-api": patch
---

Fix combining multiple fields in a `RedirectFilter`

A filter like `{ sourceType: { equal: "domain" }, active: { equal: true } }` only applied its last field, so `paginatedRedirects` also returned redirects that didn't match the other fields. All fields of a filter now have to match.

If your site's domain redirect middleware (`redirectToMainHost.ts`) only filters on `sourceType`, add `active: { equal: true }` to the filter, so redirects that are deactivated in the admin no longer redirect:

```ts
filter: { sourceType: { equal: "domain" }, active: { equal: true } },
```
