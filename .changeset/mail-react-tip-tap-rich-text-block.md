---
"@dextinity/mail-react": minor
---

Add `createTipTapRichTextBlock`

Renders CMS Tip-Tap rich text block data in emails, the successor to the draft-js block that `createRichTextBlock` renders. It goes through the same components and class names, so styling written for one block applies to the other.

**Example**

```tsx
export const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock({
    textBlockStyles: {
        title: { variant: "title" },
        header: { variant: "header" },
    },
});
```
