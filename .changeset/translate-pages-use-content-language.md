---
"@dextinity/cms-admin": patch
---

Resolve the language for translated page slugs via `useContentLanguage`

When translating pages in the page tree, the locale used to slugify the translated page name was read directly from `scope.language`.
That only works in projects whose content scope happens to contain a `language` dimension.
The language is now resolved through the `contentLanguage` config, consistent with `createEditPageNode`, which already slugifies using `useContentLanguage`.
