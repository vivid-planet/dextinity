---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Replace the TipTap Rich Text Block's `supports` array with one option per feature

`createTipTapRichTextBlock` now takes a single root options object with one option per editor feature, similar to TipTap's `StarterKit` configuration. Feature-specific options move into a nested options object of the feature they belong to: `headingLevels` becomes `heading: { levels: [...] }` and the link block becomes `link: { block: LinkBlock }`.

Every feature is enabled by default (except `underline` and `link`) and is disabled by passing `false`, so a configuration only has to state what deviates from the defaults instead of repeating every supported feature.

**Example**

```ts
// Before
createTipTapRichTextBlock({
    supports: ["bold", "italic", "strike", "sub", "sup", "heading", "ordered-list", "unordered-list"],
    headingLevels: [2, 3],
    link: LinkBlock,
});

// After
createTipTapRichTextBlock({
    nonBreakingSpace: false,
    softHyphen: false,
    heading: { levels: [2, 3] },
    link: { block: LinkBlock },
});
```

The features are named after their option: `bold`, `italic`, `underline`, `strike`, `sub`, `sup`, `heading`, `orderedList`, `unorderedList`, `nonBreakingSpace`, `softHyphen`, `link`, and `history` (Admin only). The document-level limits `maxTextBlocks` and `listLevelMax` are unchanged.
