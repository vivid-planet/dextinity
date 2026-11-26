import type { BlockContext, BlockInterface } from "@dextinity/cms-admin";

import {
    type AdditionalItemFields,
    clampInsertIndex,
    clampMoveIndex,
    createBlockChild,
    createUpdatedBlockChild,
    insertChildAt,
    moveChildToIndex,
    removeChildByKey,
    replaceChild,
    setChildVisibility,
} from "./blockChildren";
import { type BlockListName, type BlocksBlockChild, describeType, findBlockByKey } from "./blockProps";

type BlockEditOperation =
    | {
          operation: "insert";
          /** A key of the target blocks block's `supportedBlocks`, e.g. "heading". */
          type: string;
          /** The block's fields, in the shape the block is saved in — the same JSON the API's save mutation takes. */
          props: unknown;
          index?: number;
      }
    | {
          operation: "update";
          key: string;
          /** The fields to change; the ones left out keep their value. */
          props: unknown;
      }
    | {
          operation: "remove";
          key: string;
      }
    | {
          operation: "move";
          key: string;
          /** Counted in the resulting order; see `clampMoveIndex`. */
          index: number;
      }
    | {
          operation: "show" | "hide";
          key: string;
      };

/** The positions are the ones the batch produced, i.e. as of that operation having been applied. */
type BlockEditResult =
    | {
          operation: "insert";
          key: string;
          type: string;
          index: number;
          warnings?: string[];
      }
    | {
          operation: "update";
          key: string;
          type: string;
          index: number;
          warnings?: string[];
      }
    | { operation: "remove"; key: string; type: string; index: number }
    | {
          operation: "move";
          key: string;
          type: string;
          from: number;
          index: number;
      }
    | {
          operation: "show" | "hide";
          key: string;
          type: string;
          index: number;
          wasVisible: boolean;
      };

type BlockEditStep = (blocks: readonly BlocksBlockChild[]) => BlocksBlockChild[];

/** Asking for the state a block is already in — the position it holds, the visibility it has — changes nothing. */
export const isBlockEditChange = (result: BlockEditResult): boolean => {
    switch (result.operation) {
        case "move":
            return result.from !== result.index;
        case "show":
            return !result.wasVisible;
        case "hide":
            return result.wasVisible;
        case "insert":
        case "update":
        case "remove":
            return true;
    }
};

type EditBlocksRequest = {
    target: BlockListName;
    /** Applied in the order given; see `planBlockEdits`. */
    operations: BlockEditOperation[];
};

type EditBlocksResult = {
    results: BlockEditResult[];
};

export type EditBlocks = (request: EditBlocksRequest) => Promise<EditBlocksResult>;

const blockEditOperations = ["insert", "update", "remove", "move", "show", "hide"] as const;

const blockKeyPurpose = "the key of the block to act on, as get_page_state reports it";

const isBlockEditOperation = (value: unknown): value is BlockEditOperation["operation"] =>
    blockEditOperations.some((candidate) => candidate === value);

// The positions the agent reads back are 1-based: it counts the operations it wrote, not the array
// indexes it did not think about.
const describeOperation = (position: number, operation?: string) =>
    operation ? `Operation ${position + 1} ("${operation}")` : `Operation ${position + 1}`;

/**
 * The schema states the required fields per operation, but a tool schema is guidance to the agent
 * rather than something the host enforces, and a missing field otherwise surfaces one step later as
 * a lookup for the empty string.
 */
const requireField = ({
    value,
    field,
    purpose,
    position,
    operation,
}: {
    value: unknown;
    field: string;
    purpose: string;
    position: number;
    operation: string;
}): string => {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`${describeOperation(position, operation)} needs a "${field}", ${purpose}.`);
    }
    return value;
};

/**
 * Only the shape of an operation is checked here — whether a key resolves, whether a type exists, and
 * whether the props fit are questions for the page's actual content, answered while the batch is
 * planned.
 */
export function asBlockEditOperations(
    value: unknown,
    {
        defaultInsertType,
    }: {
        /** The type an insertion gets when it names none, for a block list that holds a single block type. */
        defaultInsertType?: string;
    } = {},
): BlockEditOperation[] {
    if (!Array.isArray(value)) {
        throw new Error(`"operations" must be an array of the changes to apply, but was ${describeType(value)}.`);
    }
    if (value.length === 0) {
        throw new Error(`"operations" is empty, so there is nothing to apply.`);
    }

    return value.map((entry, position) => {
        if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
            throw new Error(`${describeOperation(position)} must be an object describing one change, but was ${describeType(entry)}.`);
        }

        const { operation, key, type, props, index } = entry as Record<string, unknown>;
        if (!isBlockEditOperation(operation)) {
            throw new Error(`${describeOperation(position)} has no valid "operation". It must be one of: ${blockEditOperations.join(", ")}.`);
        }

        switch (operation) {
            case "insert":
                return {
                    operation,
                    type: requireField({
                        value: type ?? defaultInsertType,
                        field: "type",
                        purpose: "the type of block to insert",
                        position,
                        operation,
                    }),
                    props,
                    index: typeof index === "number" ? index : undefined,
                };
            case "update":
                return { operation, key: requireField({ value: key, field: "key", purpose: blockKeyPurpose, position, operation }), props };
            case "remove":
                return { operation, key: requireField({ value: key, field: "key", purpose: blockKeyPurpose, position, operation }) };
            case "move":
                return {
                    operation,
                    key: requireField({ value: key, field: "key", purpose: blockKeyPurpose, position, operation }),
                    // Not defaulted: clampMoveIndex rejects the NaN a missing or non-numeric index
                    // produces, and names what the field is for.
                    index: Number(index),
                };
            case "show":
            case "hide":
                return { operation, key: requireField({ value: key, field: "key", purpose: blockKeyPurpose, position, operation }) };
        }
    });
}

/**
 * The operations are planned in order against a working copy, so each one sees the content as the
 * preceding ones left it: a block removed earlier in the batch is gone, and a position counts the
 * blocks a preceding insertion added. Blocks inserted by the batch cannot be addressed by a later
 * operation, though — their keys are generated here, so the agent cannot have referred to one.
 *
 * Planning is what the conversion through the block definitions happens in (see `toBlockState`),
 * which is why it is asynchronous and why it is separate from applying: everything that can fail
 * has failed before the first step runs, so a rejected batch leaves the page untouched rather than
 * half-changed. There is no undo for these changes beyond not saving the page, which makes an
 * all-or-nothing batch the only one the user can reason about.
 *
 * The steps address the blocks by key, but an update replaces a block with the copy converted here.
 * The caller must therefore only apply the batch to the very list it planned against, and reject it
 * when the user changed the page while the conversions were awaited.
 */
export async function planBlockEdits({
    blocks,
    blockListName,
    maxVisibleBlocks,
    operations,
    supportedBlocks,
    insertableBlocks = supportedBlocks,
    additionalItemFields = {},
    schemaRootBlockName,
    blockContext,
}: {
    blocks: readonly BlocksBlockChild[];
    blockListName: BlockListName;
    /** The `maxVisibleBlocks` of a list block, such as the stage, which shows a single one of its items. */
    maxVisibleBlocks?: number;
    operations: BlockEditOperation[];
    supportedBlocks: Record<string, BlockInterface>;
    /**
     * The blocks an insertion may add, when the content scope offers fewer than the blocks block supports:
     * blocks already on the page can still be edited, as in the Admin's own block picker.
     */
    insertableBlocks?: Record<string, BlockInterface>;
    /** The `additionalItemFields` of the blocks block, whose default values an inserted block starts with. */
    additionalItemFields?: AdditionalItemFields;
    /** The name the block holding the editable types has in block-meta; see `toBlockState`. */
    schemaRootBlockName: string;
    blockContext: BlockContext;
}): Promise<{
    /** Applies the batch, or null when no operation changes anything — see the move case below. */
    apply: BlockEditStep | null;
    results: BlockEditResult[];
}> {
    const steps: BlockEditStep[] = [];
    const results: BlockEditResult[] = [];
    let planned: readonly BlocksBlockChild[] = blocks;

    for (const [position, edit] of operations.entries()) {
        try {
            const { result, step } = await planOperation({
                blocks: planned,
                blockListName,
                maxVisibleBlocks,
                edit,
                supportedBlocks,
                insertableBlocks,
                additionalItemFields,
                schemaRootBlockName,
                blockContext,
            });

            results.push(result);
            if (step) {
                steps.push(step);
                planned = step(planned);
            }
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            const scope = operations.length === 1 ? "so nothing was applied" : `so none of the ${operations.length} operations were applied`;

            throw new Error(`${describeOperation(position, edit.operation)} failed, ${scope} and the page is unchanged. ${reason}`);
        }
    }

    const apply: BlockEditStep = (blocks) => steps.reduce<BlocksBlockChild[]>((current, step) => step(current), [...blocks]);

    return { apply: steps.length > 0 ? apply : null, results };
}

const describeKeys = (blocks: readonly BlocksBlockChild[]) => blocks.map((block) => `"${block.key}"`).join(", ");

async function planOperation({
    blocks,
    blockListName,
    maxVisibleBlocks,
    edit,
    supportedBlocks,
    insertableBlocks,
    additionalItemFields,
    schemaRootBlockName,
    blockContext,
}: {
    blocks: readonly BlocksBlockChild[];
    blockListName: BlockListName;
    maxVisibleBlocks?: number;
    edit: BlockEditOperation;
    supportedBlocks: Record<string, BlockInterface>;
    insertableBlocks: Record<string, BlockInterface>;
    additionalItemFields: AdditionalItemFields;
    schemaRootBlockName: string;
    blockContext: BlockContext;
}): Promise<{ result: BlockEditResult; step: BlockEditStep | null }> {
    const visibleBlocks = blocks.filter((block) => block.visible !== false);
    const isMaxVisibleBlocksReached = maxVisibleBlocks !== undefined && visibleBlocks.length >= maxVisibleBlocks;

    switch (edit.operation) {
        case "insert": {
            const { child, warnings } = await createBlockChild({
                supportedBlocks: insertableBlocks,
                additionalItemFields,
                schemaRootBlockName,
                blockContext,
                type: edit.type,
                props: edit.props,
                visible: !isMaxVisibleBlocksReached,
            });
            const index = clampInsertIndex(edit.index, blocks.length);
            if (isMaxVisibleBlocksReached) {
                warnings.push(
                    `The block was inserted hidden, because the page's ${blockListName} shows at most ${maxVisibleBlocks} visible ${maxVisibleBlocks === 1 ? "block" : "blocks"}. To insert it visible, hide ${describeKeys(visibleBlocks)} in a preceding operation of the same batch.`,
                );
            }

            return {
                result: { operation: "insert", key: child.key, type: child.type, index, ...(warnings.length > 0 ? { warnings } : {}) },
                step: (blocks) => insertChildAt({ blocks, child, index }),
            };
        }
        case "update": {
            const { child: currentChild, index } = findBlockByKey({ blocks, blockListName, key: edit.key, action: "updated" });
            const { child, warnings } = await createUpdatedBlockChild({
                supportedBlocks,
                schemaRootBlockName,
                blockContext,
                child: currentChild,
                props: edit.props,
            });

            return {
                result: { operation: "update", key: child.key, type: child.type, index, ...(warnings.length > 0 ? { warnings } : {}) },
                step: (blocks) => replaceChild(blocks, child),
            };
        }
        case "remove": {
            const { child, index } = findBlockByKey({ blocks, blockListName, key: edit.key, action: "removed" });

            return {
                result: { operation: "remove", key: child.key, type: child.type, index },
                step: (blocks) => removeChildByKey(blocks, child.key),
            };
        }
        case "move": {
            const { child, index: from } = findBlockByKey({ blocks, blockListName, key: edit.key, action: "moved" });
            const index = clampMoveIndex(edit.index, blocks.length);

            return {
                result: { operation: "move", key: child.key, type: child.type, from, index },
                // No step for a move that changes nothing, so a batch of only such moves does not
                // mark the page as changed.
                step: from === index ? null : (blocks) => moveChildToIndex({ blocks, key: child.key, index }),
            };
        }
        case "show":
        case "hide": {
            const visible = edit.operation === "show";
            const { child, index } = findBlockByKey({ blocks, blockListName, key: edit.key, action: visible ? "shown" : "hidden" });
            // Visible unless the state says otherwise: an older block state may not carry the flag.
            const wasVisible = child.visible !== false;
            if (visible && !wasVisible && isMaxVisibleBlocksReached) {
                throw new Error(
                    `The page's ${blockListName} shows at most ${maxVisibleBlocks} visible ${maxVisibleBlocks === 1 ? "block" : "blocks"}, so "${child.key}" can only be shown once ${describeKeys(visibleBlocks)} ${visibleBlocks.length === 1 ? "is" : "are"} hidden. Hide ${visibleBlocks.length === 1 ? "it" : "them"} in a preceding operation of the same batch.`,
                );
            }

            return {
                result: { operation: edit.operation, key: child.key, type: child.type, index, wasVisible },
                step: wasVisible === visible ? null : (blocks) => setChildVisibility({ blocks, key: child.key, visible }),
            };
        }
    }
}
