---
"@dextinity/cms-api": minor
---

Only include used blocks in `block-meta.json`

Blocks are registered as a side effect of `createBlock`. Therefore, blocks that a library creates on import (e.g., the deprecated `SpaceBlock`) ended up in the application's `block-meta.json` even when the application didn't use them. Besides generating types for unused blocks, this caused broken types when an application defined a block with the same name (e.g., its own `Space` block).

The generated `block-meta.json` now only contains the blocks the application actually uses: all root blocks and, recursively, the blocks they reference.

Root blocks are discovered from the entities, so make sure every entity holding block data is annotated with `@RootBlockEntity()` and every column containing block data with `@RootBlock(ExampleBlock)`. Blocks of an entity missing these annotations are no longer written to `block-meta.json`.

Blocks that reference other blocks without exposing them in their block meta (e.g., the link block embedded in rich text content) must declare them in the new optional `referencedBlocks` property of `Block`:

```ts
const RichTextBlock: Block = {
    name: "RichText",
    blockDataFactory,
    blockInputFactory,
    blockMeta,
    blockInputMeta,
    referencedBlocks: [LinkBlock],
};
```

`getBlocksMeta()` accepts the blocks to generate the meta for as an optional argument. It still defaults to all registered blocks.
