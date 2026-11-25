import { describeType } from "./blockProps";
import { type BlockEditOperation, type BlockEditResult, describeOperation, isBlockEditChange } from "./planBlockEdits";

const blockEditOperations = ["insert", "update", "remove", "move", "show", "hide"] as const;

const isBlockEditOperation = (value: unknown): value is BlockEditOperation["operation"] =>
    blockEditOperations.some((candidate) => candidate === value);

/**
 * The JSON schema of the operations a block editing tool takes, as `asBlockEditOperations` checks them.
 * `stateToolName` is the tool that reports the keys of the blocks, e.g. get_page_state.
 */
export function createBlockEditOperationsSchema({ stateToolName }: { stateToolName: string }) {
    return {
        type: "array",
        description: "The changes to apply, in the order they should be applied.",
        items: {
            type: "object",
            properties: {
                operation: {
                    type: "string",
                    enum: [...blockEditOperations],
                    description:
                        "The change to make: 'insert' adds a block, 'update' changes the content of one, 'remove' takes one out, 'move' reorders one, 'show' and 'hide' decide whether one is rendered on the site. A hidden block stays where it is with its content intact.",
                },
                type: {
                    type: "string",
                    description: `insert: the block type to insert, as ${stateToolName} reports the types of the blocks. Pass an unknown value to list the insertable types.`,
                },
                key: {
                    type: "string",
                    description: `update, remove, move, show, hide: the key of the block to change, as reported by ${stateToolName}.`,
                },
                props: {
                    type: "object",
                    description:
                        "insert, update: the block's fields, in the shape the block is saved in ('inputFields'), per the schema resolved through the props mapping the tool's description names. On an update, fields that are left out keep their current value, nested fields included, so only what should change has to be passed; a list, however, is passed whole and replaces the current one.",
                },
                index: {
                    type: "number",
                    description:
                        "insert: the position among the existing blocks (0 inserts at the top), appended at the end when omitted. move: the position the block should end up at, counted in the resulting order, so 0 moves it to the top and the number of the last position moves it to the bottom; required for a move.",
                },
            },
            required: ["operation"],
            // "anyOf" rather than "oneOf" because that is the keyword tool schemas support, and "operation" makes the
            // branches mutually exclusive anyway. A tool schema is guidance to the agent, not enforced before the
            // handler runs, so asBlockEditOperations checks the same requirements itself.
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
}

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
 * whether the props fit are questions for the actual content, answered while the batch is planned.
 */
export function asBlockEditOperations(value: unknown, { stateToolName }: { stateToolName: string }): BlockEditOperation[] {
    if (!Array.isArray(value)) {
        throw new Error(`"operations" must be an array of the changes to apply, but was ${describeType(value)}.`);
    }
    if (value.length === 0) {
        throw new Error(`"operations" is empty, so there is nothing to apply.`);
    }

    const keyPurpose = `the key of the block to act on, as ${stateToolName} reports it`;

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
                    type: requireField({ value: type, field: "type", purpose: "the type of block to insert", position, operation }),
                    props,
                    index: typeof index === "number" ? index : undefined,
                };
            case "update":
                return { operation, key: requireField({ value: key, field: "key", purpose: keyPurpose, position, operation }), props };
            case "remove":
                return { operation, key: requireField({ value: key, field: "key", purpose: keyPurpose, position, operation }) };
            case "move":
                return {
                    operation,
                    key: requireField({ value: key, field: "key", purpose: keyPurpose, position, operation }),
                    // Not defaulted: clampMoveIndex rejects the NaN a missing or non-numeric index
                    // produces, and names what the field is for.
                    index: Number(index),
                };
            case "show":
            case "hide":
                return { operation, key: requireField({ value: key, field: "key", purpose: keyPurpose, position, operation }) };
        }
    });
}

/** The rules of a batch of block edits, for the description of a tool that takes `createBlockEditOperationsSchema`. */
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
