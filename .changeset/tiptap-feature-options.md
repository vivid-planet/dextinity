---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Replace the TipTap Rich Text Block's `supports` array with one option per feature

`createTipTapRichTextBlock` now takes a single root options object with one option per editor feature, similar to TipTap's `StarterKit` configuration. Feature-specific options move into a nested options object of the feature they belong to, so `headingLevels` becomes `heading: { levels: [...] }`.

Every feature is enabled by default (except `underline`) and is disabled by passing `false`, so a configuration only has to state what deviates from the defaults instead of repeating every supported feature. Links stay the exception: they are enabled by passing the link block as `link`.

**Example**

```ts
// Before
createTipTapRichTextBlock({
    supports: ["bold", "italic", "strike", "sub", "sup", "heading", "ordered-list", "unordered-list"],
    headingLevels: [2, 3],
});

// After
createTipTapRichTextBlock({
    nonBreakingSpace: false,
    softHyphen: false,
    heading: { levels: [2, 3] },
});
```

The features are named after their option: `bold`, `italic`, `underline`, `strike`, `sub`, `sup`, `heading`, `orderedList`, `unorderedList`, `nonBreakingSpace`, `softHyphen`, `link`, and `history` (Admin only). The document-level limits `maxTextBlocks` and `listLevelMax` are unchanged.
