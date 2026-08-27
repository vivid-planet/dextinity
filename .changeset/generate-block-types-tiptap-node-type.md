---
"@dextinity/cli": minor
---

Add `TipTapNode` type to `generate-block-types` output and use it for TipTap rich text blocks

TipTap rich text blocks were typed as `unknown`, forcing consumers to cast the content before rendering it.
They are now typed as `TipTapNode`, which is generated into `blocks.generated.ts` (together with `TipTapMark`) whenever a TipTap rich text block is used.

**Example**

```tsx
// Before
const content = data.tipTapContent as TipTapNode;

// After
const content = data.tipTapContent;
```
