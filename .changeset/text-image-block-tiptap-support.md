---
"@dextinity/cms-admin": minor
---

Support TipTap rich text blocks in `createTextImageBlock`

The `text` option now accepts any text block, for instance one created with `createTipTapRichTextBlock`. The data, state and input types of the returned block are derived from the passed text block.

```tsx
export const TextImageBlock = createTextImageBlock({ text: TipTapRichTextBlock, image: DamImageBlock });
```

Also export the `TipTapRichTextBlockInterface` type.
