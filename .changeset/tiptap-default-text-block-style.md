---
"@dextinity/cms-admin": minor
"@dextinity/cms-api": minor
---

TipTap Rich Text Block: add `defaultStyle` to a text block

The styling select always offered a "Default" entry standing for "no style", even where a design has no unstyled variant and every paragraph or heading is meant to carry one of the configured styles.

A text block (or list) with a `defaultStyle` has no such state: the select drops its "Default" entry, and the style is applied to new content, to a text block the editor converts through the type select, and to any paragraph or heading the editor creates without one — pressing Enter at the end of a heading, the `Mod-Alt-<level>` shortcuts, or pasting. Switching the type keeps a style the new text block also offers and falls back to its `defaultStyle` otherwise.

Toggling a list hands a paragraph from its text block to the list or back, so the styles of whichever now holds it apply. The list keyboard shortcuts do this as well as the toolbar's list buttons.

Because the default sits on the text block rather than on a shared tag, two text blocks with the same tag can have different defaults, and a text block without one keeps the "Default" entry next to text blocks that have one.

**Example**

```tsx
createTipTapRichTextBlock({
    textBlocks: [
        { name: "heading-1", label: "Heading 1", tag: "h1", styles: headlineStyles, defaultStyle: "headline300" },
        { name: "heading-2", label: "Heading 2", tag: "h2", styles: headlineStyles, defaultStyle: "headline400" },
    ],
});
```

`defaultStyle` must be one of the text block's `styles`, otherwise an error is thrown. It only exists next to `styles`, not next to a text block's own `element`.

Content written before a `defaultStyle` was configured carries no style, and the editor fills it in on the first edit rather than when the document is opened, so opening a document does not mark it as changed. `buildApplyTextBlocksMigration` gives such content its style up front and replaces a style a text block no longer offers; it now takes the `orderedList`/`unorderedList` options too, since a list item's content draws its style from the list.
