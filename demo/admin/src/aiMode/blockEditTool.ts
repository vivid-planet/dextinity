import { type BlockEditResult, isBlockEditChange } from "./editBlocks";

/** The JSON schema of the operations a block editing tool takes, as `asBlockEditOperations` checks them. */
export const blockEditOperationsSchema = {
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
                description: "update, remove, move, show, hide: the key of the block to change, as reported by get_page_state.",
            },
            props: {
                type: "object",
                description:
                    "insert, update: the block's fields, in the shape the block is saved in ('inputFields'), per the schema resolved through PageContent's props mapping. On an update, fields that are left out keep their current value, nested fields included, so only what should change has to be passed; a list, however, is passed whole and replaces the current one.",
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
        // edit_blocks checks the same requirements itself: a tool schema is guidance
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
};

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
export function describeBlockEditResults({ results, unsavedIn }: { results: BlockEditResult[]; unsavedIn: string }) {
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
