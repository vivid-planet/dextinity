---
"@dextinity/cms-api": minor
---

Write a block's description to `block-meta.json`

Tools that read `block-meta.json` can use the description to tell the blocks of an application apart.

**Example**

```ts
export const HeadlineBlock = createBlock(HeadlineBlockData, HeadlineBlockInput, {
    name: "Headline",
    description: "A headline with an optional eyebrow text above it. Use it to introduce a section.",
});
```

```json title="block-meta.json"
{
    "name": "Headline",
    "description": "A headline with an optional eyebrow text above it. Use it to introduce a section.",
    "fields": [{ "name": "eyebrow", "kind": "String", "nullable": true }],
    "inputFields": [{ "name": "eyebrow", "kind": "String", "nullable": true }]
}
```
