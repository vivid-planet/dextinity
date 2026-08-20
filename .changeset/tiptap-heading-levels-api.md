---
"@dextinity/cms-api": minor
---

Allow restricting selectable heading levels in the TipTap rich text block via a new `headingLevels` option

`createTipTapRichTextBlock` accepts a new `headingLevels?: number[]` option to limit which heading levels (1-6) are allowed, mirroring the same option added to `@dextinity/cms-admin`. Content with a heading level outside this set is rejected during validation. Defaults to `[1, 2, 3, 4, 5, 6]`, so existing usages are unaffected. Must be a non-empty array of unique integers between 1 and 6, otherwise an error is thrown.

```tsx
createTipTapRichTextBlock({
    supports: ["heading"],
    headingLevels: [2, 3, 4],
});
```
