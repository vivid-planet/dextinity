---
"@dextinity/cms-admin": minor
---

Allow restricting selectable heading levels in the TipTap rich text block via a new `headingLevels` option

`createTipTapRichTextBlock` accepts a new `headingLevels?: number[]` option to limit which heading levels (1-6) are selectable. Defaults to `[1, 2, 3, 4, 5, 6]`, so existing usages are unaffected.

```tsx
createTipTapRichTextBlock({
    supports: ["heading"],
    headingLevels: [2, 3, 4],
});
```
