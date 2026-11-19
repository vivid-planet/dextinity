import type { BlockContext } from "../blocks/context/BlockContext";
import type { BlockInterface } from "../blocks/types";
import type { AiModeTool, AiModeToolHelpers } from "./AiModeToolsets";
import type { AdditionalItemFields } from "./blockChildren";
import type { BlocksBlockChild } from "./blockProps";
import { asBlockEditOperations, type BlockEditResult, isBlockEditChange, planBlockEdits } from "./editBlocks";

/** A blocks block whose top-level blocks a block editing tool changes. */
export type EditableBlocksBlock = {
    /** The `supportedBlocks` of the blocks block. */
    supportedBlocks: Record<string, BlockInterface>;
    /**
     * The blocks an insertion may add, when the content scope offers fewer than the blocks block supports, e.g. as
     * `isBlockSupported` of the blocks config decides. Blocks already there can still be edited.
     */
    insertableBlocks?: Record<string, BlockInterface>;
    /** The `additionalItemFields` of the blocks block, whose default values an inserted block starts with. */
    additionalItemFields?: AdditionalItemFields;
    /** The block's name in block-meta, where the agent looks up the block schemas, e.g. "PageContent" for `PageContentBlock`. */
    schemaBlockName: string;
    blockContext: BlockContext;
    /** The current blocks. They are read again after planning, to reject a batch when they changed meanwhile. */
    getBlocks: () => readonly BlocksBlockChild[];
    /** Applies a planned batch to the current blocks in one update, so that the content is marked as changed once. */
    updateBlocks: (update: (blocks: BlocksBlockChild[]) => BlocksBlockChild[]) => void;
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** The JSON schema of the operations a block editing tool takes, as `asBlockEditOperations` checks them. */
export const createBlockEditOperationsSchema = ({ stateToolName, schemaBlockName }: { stateToolName: string; schemaBlockName?: string }) => ({
    type: "array",
    description: "The changes to apply, in the order they should be applied.",
    items: {
        type: "object",
        properties: {
            operation: {
                type: "string",
                enum: ["insert", "update", "remove", "move", "show", "hide"],
                description:
                    "The change to make: 'insert' adds a block, 'update' changes the content of one, 'remove' takes one out, 'move' reorders one, 'show' and 'hide' decide whether one is rendered on the site. A hidden block stays on the page with its content intact.",
            },
            type: {
                type: "string",
                description: "insert: the block type to insert, e.g. 'heading' or 'richtext'. Pass an unknown value to list the insertable types.",
            },
            key: {
                type: "string",
                description: `update, remove, move, show, hide: the key of the block to change, as reported by ${stateToolName}.`,
            },
            props: {
                type: "object",
                description: `insert, update: the block's fields, in the shape the block is saved in ('inputFields'), per the schema resolved through ${schemaBlockName ? `${schemaBlockName}'s` : "the blocks block's"} props mapping. On an update, fields that are left out keep their current value, nested fields included, so only what should change has to be passed; a list, however, is passed whole and replaces the current one.`,
            },
            index: {
                type: "number",
                description:
                    "insert: the position among the existing blocks (0 inserts at the top), appended at the end when omitted. move: the position the block should end up at, counted in the resulting order, so 0 moves it to the top and the number of the last position moves it to the bottom; required for a move.",
            },
        },
        required: ["operation"],
        // "anyOf" rather than "oneOf" because that is the keyword tool schemas
        // support, and "operation" makes the branches mutually exclusive anyway.
        // asBlockEditOperations checks the same requirements itself: a tool schema is guidance
        // to the agent, not something enforced before the handler runs.
        anyOf: [
            { properties: { operation: { const: "insert" } }, required: ["operation", "type", "props"] },
            { properties: { operation: { const: "update" } }, required: ["operation", "key", "props"] },
            { properties: { operation: { const: "remove" } }, required: ["operation", "key"] },
            { properties: { operation: { const: "move" } }, required: ["operation", "key", "index"] },
            { properties: { operation: { const: "show" } }, required: ["operation", "key"] },
            { properties: { operation: { const: "hide" } }, required: ["operation", "key"] },
        ],
    },
});

/** The rules of a batch of block edits, for the description of a tool that takes `blockEditOperationsSchema`. */
export function describeBlockEditBatch({ stateToolName }: { stateToolName: string }) {
    return (
        "Pass every change a request needs as one batch. The operations are applied in the order given, each one seeing the content as the preceding ones left it, and they either all apply or none do: an operation that fails — an unknown block type, a key that does not resolve, props that do not fit — leaves the content untouched and says what was wrong, so nothing is left half-changed. " +
        `Blocks are addressed by the 'key' ${stateToolName} reports for them; a block inserted by the batch cannot be addressed by a later operation in it, because its key is generated on insertion. `
    );
}

/** How the agent finds the fields of a block type, starting from the block that holds the editable blocks. */
export function describeBlockSchemaLookup({ schemaRootBlockName, stateToolName }: { schemaRootBlockName: string; stateToolName: string }) {
    return (
        `To find out what to pass, start at the '${schemaRootBlockName}' block: call get_block_schema for '${schemaRootBlockName}', follow its inputFields -> blocks -> props mapping to get the block name for the type you want — the type ${stateToolName} reports, for a block already there — then call get_block_schema for that name for the fields to put in 'props'. ` +
        "Do not guess a block's name from its type — resolve it through that mapping, because the two differ, and a name that exists is not proof that it is the right one"
    );
}

/** The result of a block editing tool, counting the changes, which are unsaved. */
function describeBlockEditResults({ results, unsavedIn }: { results: BlockEditResult[]; unsavedIn: string }) {
    const changes = results.filter(isBlockEditChange).length;
    if (changes === 0) {
        return { changes, message: "Nothing changed: every block is already in the state it was asked to be put in.", results };
    }
    return {
        changes,
        message: `Applied ${changes} ${changes === 1 ? "change" : "changes"} to ${unsavedIn}. The ${changes === 1 ? "change is" : "changes are"} unsaved — the user has to save it.`,
        results,
    };
}

/**
 * Plans the operations against the blocks and applies them as one batch: all or nothing, and rejected as a whole when
 * the blocks changed while it was planned. Returns the tool's result.
 */
export async function editBlocksBlock({
    operations,
    blocksBlock: { getBlocks, updateBlocks, schemaBlockName, ...blocksBlock },
    contentName,
    stateToolName,
    clearTextSelection,
}: {
    operations: unknown;
    blocksBlock: EditableBlocksBlock;
    /** Names the content in the result, e.g. "the page's content". */
    contentName: string;
    stateToolName: string;
} & AiModeToolHelpers) {
    const plannedBlocks = getBlocks();
    const { apply, results } = await planBlockEdits({
        ...blocksBlock,
        blocks: plannedBlocks,
        operations: asBlockEditOperations(operations, { stateToolName }),
        schemaRootBlockName: schemaBlockName,
    });

    if (apply) {
        // Planning awaits conversions that can query the API. Applied to blocks that changed meanwhile, by the user or
        // because other content was opened, the batch would undo those changes or edit the wrong content, so it is
        // rejected as a whole instead.
        if (getBlocks() !== plannedBlocks) {
            throw new Error(
                `${capitalize(contentName)} changed while the edits were prepared, so none of the operations were applied. Call ${stateToolName} again and retry.`,
            );
        }
        updateBlocks(apply);
    }

    const { changes, ...result } = describeBlockEditResults({ results, unsavedIn: contentName });
    if (changes > 0) {
        // The selection is the text before the change. The user selects again to ask about the new text.
        clearTextSelection();
    }
    return result;
}

/**
 * A tool that inserts, updates, removes, moves, hides, and shows the top-level blocks of a blocks block, e.g. the content
 * of a page. The changes are unsaved, as if the user had made them by hand, and the user approves every call.
 */
export function createEditBlocksTool({
    name,
    description,
    contentName,
    stateToolName,
    schemaNameExamples,
    restrictions,
    ...blocksBlock
}: EditableBlocksBlock & {
    /** The tool's name, e.g. "edit_blocks". */
    name: string;
    /** The start of the tool's description: what the tool changes, and which requests it is for. */
    description: string;
    /** Names the content in the description and the result, e.g. "the page's content". */
    contentName: string;
    /** The tool that reports the keys and types of the blocks, e.g. "get_page_state". */
    stateToolName: string;
    /**
     * Block types whose name in block-meta differs from their type, for the agent's schema lookup, e.g. "'image' is the
     * 'DamImage' block".
     */
    schemaNameExamples?: string;
    /** What the tool can't change, at the end of the description, e.g. that only the top-level blocks can be edited. */
    restrictions?: string;
}): AiModeTool {
    const { schemaBlockName } = blocksBlock;

    return {
        name,
        description:
            `${description} ` +
            `Make the change with this tool rather than writing the new text into the chat or telling the user how to make it by hand. The chat asks the user to approve every call before it runs, so call the tool instead of asking for permission in the chat first. ` +
            `The changes are applied as unsaved changes, exactly as if the user had made them by hand, so the user sees them in the admin, and saves or discards them. ` +
            `A request about 'this text' is about the text in the context's 'selection': change only that part of the block's text and keep the rest. ` +
            `Typical flow: ${stateToolName} for the keys and types of the blocks, get_block_schema for the fields of the blocks to change (see below), then one ${name} call; afterwards, tell the user briefly what was changed and that it still has to be saved. ${describeBlockEditBatch(
                { stateToolName },
            )}${capitalize(contentName)} is the '${schemaBlockName}' block. ${describeBlockSchemaLookup({
                schemaRootBlockName: schemaBlockName,
                stateToolName,
            })}${schemaNameExamples ? `: ${schemaNameExamples}` : ""}.${restrictions ? ` ${restrictions}` : ""}`,
        inputSchema: {
            type: "object",
            properties: { operations: createBlockEditOperationsSchema({ stateToolName, schemaBlockName }) },
            required: ["operations"],
        },
        // The chat runs a tool without asking only if it is read-only, so the user approves every edit.
        readOnlyHint: false,
        handler: (args, helpers) => editBlocksBlock({ operations: args.operations, blocksBlock, contentName, stateToolName, ...helpers }),
    };
}
