---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

Change the TipTap Rich Text Block's `supports` option from an array to an object of booleans

The values passed are merged into the defaults, so a single feature can be disabled without repeating all others.

**Example**

```ts
// Before
createTipTapRichTextBlock({
    supports: ["history", "bold", "italic", "strike", "sub", "sup", "ordered-list", "unordered-list", "non-breaking-space", "soft-hyphen"],
});

// After
createTipTapRichTextBlock({
    supports: { heading: false },
});
```

The features are named `bold`, `italic`, `underline`, `strike`, `sub`, `sup`, `heading`, `orderedList`, `unorderedList`, `nonBreakingSpace`, `softHyphen`, `link` and (Admin only) `history`.
All of them are enabled by default, except `underline`.

`link` no longer has to be enabled explicitly when a `link` block is passed, but it can now be disabled with `supports: { link: false }`.

`TipTapSupports` is now the type of the whole `supports` object (previously it was the union of the feature names) and is exported from both packages.
