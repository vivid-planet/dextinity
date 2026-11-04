---
"@dextinity/mail-react": minor
---

Add a `textClassName` prop to the rich-text components of `createRichTextBlock` and `createTipTapRichTextBlock`

The components put the class on each text element they render.
The rich-text components have no root element of their own, so for a rich text inside a column, pass the class from `withPreview` this way to make it selectable in the block preview:

```tsx
<MjmlRichTextBlock data={data} textClassName={className} />
```
