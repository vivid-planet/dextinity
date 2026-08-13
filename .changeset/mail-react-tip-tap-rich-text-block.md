---
"@dextinity/mail-react": minor
---

Add `createTipTapRichTextBlock`

Renders CMS `TipTapRichTextBlock` data in emails, as `createRichTextBlock` does for the draft-js block. The factory is experimental, as is the CMS block whose data it renders. It returns an `MjmlTipTapRichTextBlock`/`HtmlTipTapRichTextBlock` pair and is configured per call: `blockTypes` and `textBlockStyles` map the editor's text blocks to theme styling, `linkTypes` resolves link marks to hrefs (with a built-in `external` resolver), `marks` styles Tip-Tap marks (with built-in `bold`, `italic`, `underline`, `strike`, `superscript` and `subscript`), and `inlineStyles` renders the inline styles the application defines in its RTE.

**Example**

```tsx
export const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock({
    blockTypes: {
        "heading-1": { variant: "title" },
    },
    textBlockStyles: {
        intro: { variant: "intro" },
    },
});
```

Both factories render lists through the same table and emit the same `richTextBlock__*` class names, so CSS written for one applies to the other.

`placeholder` nodes render their literal `{{name}}` text, and `cmsBlock` and `cmsInlineBlock` nodes render nothing.
