---
"@dextinity/cms-api": minor
---

Add default descriptions to `createOneOfBlock`, `createLinkBlock`, `createListBlock`, `createBlocksBlock` and `createOptionalBlock`

The descriptions state the rules of the block input that the fields in `block-meta.json` don't show, for instance that `activeType` of a one-of block must name an entry in `attachedBlocks`.
This lets tools outside the admin, such as AI agents, build valid input for these blocks from the block meta alone.
Pass `description` in the options to replace the default:

```ts
createListBlock({ block: TeaserItemBlock }, { name: "Teaser", description: "Teaser items, shown side by side." });
```
