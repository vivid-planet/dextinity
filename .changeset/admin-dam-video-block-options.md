---
"@dextinity/cms-admin": minor
---

Replace the `supports` option of `createDamVideoBlock` with one option per feature

`controls` and `previewImage` are enabled by default and disabled by passing `false`, so a configuration only states what it leaves out, like the options of `createTipTapRichTextBlock`.
A disabled option is neither offered in the editor nor sent to the API, so disable the same options in the API block created with `createDamVideoBlock`, which rejects input for an option it doesn't have.
`supports` is deprecated and can't be combined with the new options. It keeps only hiding options from the editor, as the `DamVideoBlock` exported by the API requires them, so replace it together with the API block:

```diff
-createDamVideoBlock({ name: "TeaserVideo", supports: ["controls"] });
+createDamVideoBlock({ name: "TeaserVideo", previewImage: false });
```
