---
"@dextinity/cms-api": major
"@dextinity/cms-admin": major
---

Replace `paragraph`/`heading` options with configurable `textBlocks`

The text block type select could only ever offer a fixed paragraph entry plus every enabled heading level, in a fixed order, with no way to show two distinct entries for the same underlying tag (e.g. a "Display" heading-1 variant next to a plain "Heading 1"). `textBlockStyles`' `appliesTo`-based style selection had the same limitation for styles.

`textBlocks` replaces the `paragraph`/`heading` options with a single ordered array of text block entries, driving both the type dropdown's content and order directly. Multiple entries may share a `tag`; the stored `textBlockName` attribute (now mandatory on every paragraph/heading node) disambiguates them.

**Example**

```tsx
createTipTapRichTextBlock({
    textBlocks: [
        { name: "paragraph", tag: "paragraph", label: "Paragraph", styles: ["copy100", "copy200"], defaultStyle: "copy100" },
        { name: "display", tag: "heading-1", label: "Display", styles: ["display100"], defaultStyle: "display100" },
        { name: "heading-1", tag: "heading-1", label: "Heading 1" },
        { name: "heading-2", tag: "heading-2", label: "Heading 2" },
    ],
    textBlockStyles: [
        { name: "copy100", label: "Copy 100", element: (props) => <p {...props} /> },
        { name: "copy200", label: "Copy 200", element: (props) => <p {...props} /> },
        { name: "display100", label: "Display", isTextBlockType: true, element: (props) => <h1 style={{ fontSize: 64 }} {...props} /> },
    ],
});
```

**Migrating existing usage**

- Replace `paragraph`/`heading` options with a `textBlocks` array covering the same levels.
- Replace `textBlockStyles[].appliesTo` with `textBlocks[].styles` — a style's applicability is now listed on the block, not the style.
- Replace `appliesTo: ["ordered-list", "unordered-list"]` on a style with the new top-level `listStyles` option.
- For a style that's really a distinct block type in its own right (e.g. "Display" above "Heading 1"), add a dedicated `textBlocks` entry for it and mark its one `textBlockStyles` entry `isTextBlockType: true` (admin only): as that entry's sole style and `defaultStyle`, it hides the entry's style dropdown entirely.
- Existing stored content is migrated automatically: a new migration step backfills `textBlockName` and corrects `textBlockStyle` for legacy content.
