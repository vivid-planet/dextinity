---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
"@dextinity/site-react": minor
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
- `migrateFromDraftJs`' `textBlockStyleMap` → `textBlockMap`, which now takes a `{ textBlock, textBlockStyle }` object for every DraftJS block type: `textBlock` names the text block the block becomes (instead of the tag the previous `textBlockType` named), `textBlockStyle` stays optional. Where two text blocks share a heading tag, `textBlockMap` has to name the one a DraftJS `header-one`…`header-six` becomes, unless it is the `defaultTextBlock` — the block throws otherwise, because the conversion runs once and the DraftJS content is gone afterwards.

**The stored format changes**

Every paragraph and heading is now one `textBlock` node that names its text block, instead of a `paragraph`/`heading` node with a `level`:

```json
{ "type": "textBlock", "attrs": { "textBlock": "heading-2" }, "content": [{ "type": "text", "text": "Headline" }] }
```

The tag lives in the configuration, so changing a text block's `tag` takes effect without a migration, while renaming or removing one invalidates the content that names it.

Content stored by an earlier version holds `paragraph` and `heading` nodes. A vendor migration converts it when the block is loaded, so a project needs no migration of its own. It resolves the text block from the node's tag, which is unambiguous for that content: two text blocks could not share a tag before `textBlocks` existed.

A project migration sees the converted nodes, because the vendor migrations run before the block's own. A migration written against `{ type: "heading", attrs: { level } }` has to be changed to match `{ type: "textBlock", attrs: { textBlock } }`.

On the site, `renderTipTapRichText` renders a `textBlock` by its name: `heading-1` to `heading-6` — the default text blocks — as `<h1>` to `<h6>`, anything else as `<p>`. A block that renames a text block or adds one needs its own handler, which reads the name:

```tsx
const nodeMapping: Record<string, TipTapNodeHandler> = {
    textBlock: ({ node, children }) => <Headline variant={node.attrs?.textBlock}>{children}</Headline>,
};
```
