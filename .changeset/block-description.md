---
"@dextinity/cms-api": minor
---

Add a `description` option to `createBlock`

A block's name alone often doesn't say what the block is meant for. The description holds that information, so that consumers of the block meta, such as editor tooling and AI agents, can tell blocks apart.

**Example**

```ts
export const HeadlineBlock = createBlock(HeadlineBlockData, HeadlineBlockInput, {
    name: "Headline",
    description: "A headline with an optional eyebrow text above it. Use it to introduce a section.",
});
```

The block factories that take a name, for instance `createBlocksBlock` and `createOneOfBlock`, accept the description in their options as well.
