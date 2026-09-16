---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: replace the `paragraph` and `heading` options with `textBlocks`

The text block type select could only ever offer a fixed paragraph entry plus every enabled heading level, in a fixed order. `textBlocks` configures the text block types explicitly, which decouples a text block from the tag it is stored as and lets several text blocks share a tag, for instance a display headline next to a regular heading 1.

**Example**

```tsx
createTipTapRichTextBlock({
    textBlocks: [
        { name: "paragraph", label: "Paragraph", tag: "p" },
        { name: "display", label: "Display", tag: "h1" },
        { name: "heading-1", label: "Heading 1", tag: "h1" },
        { name: "heading-2", label: "Heading 2", tag: "h2" },
    ],
    defaultTextBlock: "paragraph",
});
```

The API takes the same option without the labels.

**Migrating an existing configuration**

- `paragraph`/`heading` → one `textBlocks` entry per text block type (`tag: "p"` for the paragraph, `h1`-`h6` for the headings). It defaults to a paragraph plus a heading for every level, so only a restricted set needs to be configured. Leaving the paragraph out replaces `paragraph: false`.
- `heading: { levels }` → the `textBlocks` entries for those levels.
- `heading: { defaultLevel }` → `defaultTextBlock`, which names the text block new content starts with and defaults to the first one.
- `migrateFromDraftJs`' `textBlockStyleMap` → `textBlockMap`, whose `{ textBlockType, textBlockStyle }` form becomes `{ textBlock, textBlockStyle }` and names a text block instead of a tag.

A paragraph/heading node now stores the text block it belongs to in its `textBlock` attribute, next to the existing `textBlockStyle`. Content written before this change keeps working: a node without a `textBlock` falls back to the first text block with a matching tag. Before a second text block for that tag is added — a `display` above an existing `heading-1`, which would otherwise take over that content — `buildApplyTextBlocksMigration` writes the resolved name into the content once.
