---
"@dextinity/cms-admin": minor
---

Replace the `supports` option of `createDamVideoBlock` with one option per feature

`controls` and `previewImage` are enabled by default and disabled by passing `false`, so a configuration only states what it leaves out, like the options of `createTipTapRichTextBlock`.
`supports` is deprecated and can't be combined with the new options.

```diff
-createDamVideoBlock({ name: "TeaserVideo", supports: ["controls"] });
+createDamVideoBlock({ name: "TeaserVideo", previewImage: false });
```
