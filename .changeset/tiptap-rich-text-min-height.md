---
"@dextinity/cms-admin": minor
---

Add `minHeight` option to `createTipTapRichTextBlock`

The editor's content area previously had a hardcoded minimum height of 200px with no way to override it. Compact use cases (e.g. a single-line rich text field) now have a supported way to shrink it:

```ts
createTipTapRichTextBlock({ minHeight: 0 });
```
