import type { BlockContext, BlockInterface } from "@dextinity/cms-admin";

import { asBlockProps, type BlocksBlockChild, mergeBlockProps, toBlockState, updateBlockState } from "./blockProps";

/** The `additionalItemFields` of a blocks block, e.g. the user group of each block on a page. */
export type AdditionalItemFields = Record<string, { defaultValue: unknown }>;

// Kept apart from `planBlockEdits`: nothing here knows about batches, about the agent, or about the
// order the changes arrive in.

/**
 * The type check against `supportedBlocks` is the one check the client is authoritative for.
 *
 * The agent's fields are merged into the block's default values, and the item gets the default values of
 * the additional item fields, as the Admin's own "add block" does: a block converts only the fields it is
 * given, so a field left out would otherwise stay empty rather than take its default — an image block
 * without `aspectRatio` shows an empty select. A missing additional item field, such as the user group,
 * fails the API's validation when the page is saved.
 */
export async function createBlockChild({
    supportedBlocks,
    additionalItemFields,
    schemaRootBlockName,
    blockContext,
    type,
    props,
    visible,
}: {
    supportedBlocks: Record<string, BlockInterface>;
    additionalItemFields: AdditionalItemFields;
    /**
     * The name the block containing `supportedBlocks` has in block-meta, which is what
     * get_block_schema resolves. Stated by the caller rather than read off the Admin block, whose
     * own `name` is not reliably the block-meta one (StandaloneMediaBlock, for instance, is called
     * "Media" in the Admin but "StandaloneMedia" in block-meta).
     */
    schemaRootBlockName: string;
    blockContext: BlockContext;
    type: string;
    props: unknown;
    /** False when the block list allows no further visible block, as in the Admin's own "add block". */
    visible: boolean;
}): Promise<{ child: BlocksBlockChild; warnings: string[] }> {
    const block = supportedBlocks[type];
    if (!block) {
        throw new Error(`Unknown block type "${type}". Insertable types: ${Object.keys(supportedBlocks).sort().join(", ")}.`);
    }

    const blockProps = asBlockProps(props);
    const { state, warnings } = await toBlockState({
        block,
        type,
        schemaRootBlockName,
        props: mergeBlockProps(block.state2Output(block.defaultValues()), blockProps),
        givenFields: Object.keys(blockProps),
        blockContext,
    });

    return {
        // Matches what the Admin's own "add block" does, slide-in included, so the new block is as
        // noticeable to the user as one they added themselves.
        child: {
            key: crypto.randomUUID(),
            type,
            visible,
            selected: false,
            slideIn: true,
            props: state,
            ...Object.fromEntries(Object.entries(additionalItemFields).map(([field, { defaultValue }]) => [field, defaultValue])),
        },
        warnings,
    };
}

export function clampInsertIndex(index: number | undefined, blockCount: number): number {
    // NaN would survive the clamp below and then silently slice from 0, reporting a position the
    // block was not inserted at.
    if (index === undefined || Number.isNaN(index)) {
        return blockCount;
    }
    return Math.min(Math.max(Math.trunc(index), 0), blockCount);
}

export function insertChildAt({
    blocks,
    child,
    index,
}: {
    blocks: readonly BlocksBlockChild[];
    child: BlocksBlockChild;
    index: number;
}): BlocksBlockChild[] {
    const at = clampInsertIndex(index, blocks.length);
    return [...blocks.slice(0, at), child, ...blocks.slice(at)];
}

/** Confined to the block being updated, so it cannot disturb the rest of the page; see `updateBlockState`. */
export async function createUpdatedBlockChild({
    supportedBlocks,
    schemaRootBlockName,
    blockContext,
    child,
    props,
}: {
    supportedBlocks: Record<string, BlockInterface>;
    /** The name the block holding the updatable types has in block-meta; see `toBlockState`. */
    schemaRootBlockName: string;
    blockContext: BlockContext;
    child: BlocksBlockChild;
    props: unknown;
}): Promise<{ child: BlocksBlockChild; warnings: string[] }> {
    const block = supportedBlocks[child.type];
    if (!block) {
        throw new Error(`The block "${child.key}" is of type "${child.type}", which the page's content does not support. It cannot be updated.`);
    }

    const { state, warnings } = await updateBlockState({ block, type: child.type, schemaRootBlockName, state: child.props, props, blockContext });

    return { child: { ...child, props: state }, warnings };
}

export function replaceChild(blocks: readonly BlocksBlockChild[], child: BlocksBlockChild): BlocksBlockChild[] {
    return blocks.map((block) => (block.key === child.key ? child : block));
}

export function removeChildByKey(blocks: readonly BlocksBlockChild[], key: string): BlocksBlockChild[] {
    return blocks.filter((block) => block.key !== key);
}

export function setChildVisibility({
    blocks,
    key,
    visible,
}: {
    blocks: readonly BlocksBlockChild[];
    key: string;
    visible: boolean;
}): BlocksBlockChild[] {
    return blocks.map((block) => (block.key === key ? { ...block, visible } : block));
}

/**
 * The position is the one in the resulting order, i.e. where the block sits once it has been taken
 * out and put back in, which is what the agent reads back off the block state summary afterwards.
 */
export function clampMoveIndex(index: number, blockCount: number): number {
    const lastPosition = Math.max(blockCount - 1, 0);
    // Covers NaN (a non-numeric "index" the agent sent) as well as ±Infinity: NaN would survive the
    // clamp below and then silently slice from 0, reporting a position the block was not moved to.
    if (!Number.isFinite(index)) {
        throw new Error(`"index" must be the position to move the block to, a number between 0 and ${lastPosition}.`);
    }
    return Math.min(Math.max(Math.trunc(index), 0), lastPosition);
}

export function moveChildToIndex({ blocks, key, index }: { blocks: readonly BlocksBlockChild[]; key: string; index: number }): BlocksBlockChild[] {
    const from = blocks.findIndex((block) => block.key === key);
    if (from === -1) {
        return [...blocks];
    }

    const to = clampMoveIndex(index, blocks.length);
    const remaining = [...blocks.slice(0, from), ...blocks.slice(from + 1)];
    return [...remaining.slice(0, to), blocks[from], ...remaining.slice(to)];
}

/**
 * The items of a list block, such as the stage, have no type, because they are all of the one block the list
 * holds. Giving them that block's type lets them be edited like the children of a blocks block.
 */
export function withListItemType<Item extends { key: string; visible: boolean; props: unknown }>(
    items: readonly Item[],
    type: string,
): BlocksBlockChild[] {
    return items.map((item) => ({ selected: false, slideIn: false, ...item, type }));
}

export function withoutListItemType(blocks: readonly BlocksBlockChild[]): Omit<BlocksBlockChild, "type">[] {
    return blocks.map(({ type: _type, ...item }) => item);
}
