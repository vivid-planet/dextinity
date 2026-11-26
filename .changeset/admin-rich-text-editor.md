---
"@dextinity/admin": minor
---

Add `TipTapRichTextEditor` and `TipTapRichTextEditorField`

A TipTap-based rich text editor for fields outside of blocks, e.g. an entity's description. It stores TipTap JSON and supports the same options as `createTipTapRichTextBlock`. Links store the data of a form you pass, for instance a URL:

```tsx
const options: TipTapRichTextEditorOptions = {
    textBlocks: [
        { name: "paragraph", tag: "p", label: "Paragraph" },
        { name: "heading-2", tag: "h2", label: "Heading 2" },
    ],
    link: {
        createInitialData: () => ({ url: "" }),
        Form: ({ data, onChange }) => <TextField label="URL" value={data.url} onChange={(event) => onChange({ url: event.target.value })} />,
    },
};

<TipTapRichTextEditorField name="description" label="Description" options={options} required />;
```

A required field also rejects an editor the user emptied. Use `isTipTapRichTextEmpty` for the same check elsewhere.
