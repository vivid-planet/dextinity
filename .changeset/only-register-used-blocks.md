---
"@dextinity/cms-api": major
---

Generate `block-meta.json` from the used blocks and remove the block registry

Blocks were registered as a side effect of `createBlock`. Therefore, blocks that a library creates on import (e.g., the deprecated `SpaceBlock`) ended up in the application's `block-meta.json` even when the application didn't use them. Besides generating types for unused blocks, this caused broken types when an application defined a block with the same name (e.g., its own `Space` block).

`block-meta.json` now only contains the blocks the application actually uses: all root blocks and, recursively, the blocks they reference. Root blocks are discovered from the entities, so make sure every entity holding block data is annotated with `@RootBlockEntity()` and every column containing block data with `@RootBlock(ExampleBlock)`. Blocks of an entity missing these annotations are no longer written to `block-meta.json`.

Nothing reads the registry anymore, so `registerBlock()` and `getRegisteredBlocks()` are removed. `getBlocksMeta()` requires the blocks to generate the meta for and returns their meta together with the meta of all blocks they reference:

```ts
const metaJson = getBlocksMeta([PageContentBlock, SeoBlock]);
```
