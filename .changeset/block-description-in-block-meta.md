---
"@dextinity/cms-api": minor
"@dextinity/cli": minor
---

Write a block's description to `block-meta.json` and to the generated block interfaces

`generate-block-types` turns the description into a comment above the block's interfaces, so it shows up in the editor and for tools that read the generated file.

**Example**

```ts
export const HeadlineBlock = createBlock(HeadlineBlockData, HeadlineBlockInput, {
    name: "Headline",
    description: "A headline with an optional eyebrow text above it. Use it to introduce a section.",
});
```

```ts title="blocks.generated.ts"
/**
 * A headline with an optional eyebrow text above it. Use it to introduce a section.
 */
export interface HeadlineBlockData {
    eyebrow?: string;
}
```
