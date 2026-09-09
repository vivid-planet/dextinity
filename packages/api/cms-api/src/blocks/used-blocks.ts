import { type Block, type BlockMetaField, BlockMetaFieldKind, type BlockMetaInterface } from "./block";

function getBlocksOfMetaField(field: BlockMetaField): Block[] {
    switch (field.kind) {
        case BlockMetaFieldKind.Block:
            return [field.block];
        case BlockMetaFieldKind.OneOfBlocks:
            return Object.values(field.blocks);
        case BlockMetaFieldKind.TipTapRichTextBlock:
            return Object.values(field.childBlocks);
        case BlockMetaFieldKind.NestedObject:
        case BlockMetaFieldKind.NestedObjectList:
            return getBlocksOfMeta(field.object);
        default:
            return [];
    }
}

function getBlocksOfMeta(meta: BlockMetaInterface): Block[] {
    return meta.fields.flatMap((field) => getBlocksOfMetaField(field));
}

/**
 * Returns all blocks that are used by the given root blocks: the root blocks themselves and, recursively, all blocks they reference.
 *
 * Blocks are registered as a side effect of `createBlock`. Therefore, blocks a library creates on import (e.g., the deprecated `SpaceBlock`)
 * are registered even when the application doesn't use them. Use this function to narrow the registered blocks down to the used ones.
 */
export function getUsedBlocks(rootBlocks: Block[]): Block[] {
    const usedBlocks = new Set<Block>();
    const blocksToVisit = [...rootBlocks];

    while (blocksToVisit.length > 0) {
        const block = blocksToVisit.pop();

        if (!block || usedBlocks.has(block)) {
            continue;
        }
        usedBlocks.add(block);

        blocksToVisit.push(...getBlocksOfMeta(block.blockMeta), ...getBlocksOfMeta(block.blockInputMeta), ...(block.referencedBlocks ?? []));
    }

    return Array.from(usedBlocks);
}
