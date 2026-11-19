import type { BlockContext, BlockInterface } from "@dextinity/cms-admin";
import type { FormApi } from "final-form";

import type { AiModeTool } from "./AiModeScopes";
import { blockEditOperationsSchema, describeBlockEditBatch, describeBlockEditResults, describeBlockSchemaLookup } from "./blockEditTool";
import type { BlocksBlockChild } from "./blockProps";
import { summarizeBlockState } from "./blockStateSummary";
import { asBlockEditOperations, planBlockEdits } from "./editBlocks";

/** A field of a form the AI Mode reads, and except for a single block, also changes. */
export type AiModeFormField = { name: string; label: string } & (
    | { type: "text" }
    | { type: "date" }
    | { type: "select"; options: Array<{ value: string; label: string }> }
    /** A block the agent can read but not change, e.g. an image. */
    | { type: "block"; block: BlockInterface }
    /** A blocks block, whose blocks the agent inserts, updates, removes, moves, hides, and shows. */
    | {
          type: "blocks";
          block: BlockInterface;
          /** The `supportedBlocks` of the blocks block. */
          supportedBlocks: Record<string, BlockInterface>;
          /** The block's name in block-meta, where the agent looks up the block schemas, e.g. "NewsContent" for `NewsContentBlock`. */
          schemaBlockName: string;
      }
);

type ValueField = Extract<AiModeFormField, { type: "text" | "date" | "select" }>;
type BlocksField = Extract<AiModeFormField, { type: "blocks" }>;
type BlocksState = { blocks: BlocksBlockChild[] };

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function getValueSchema(field: ValueField) {
    if (field.type === "date") {
        return { type: "string", description: `${field.label}, as a date in the format YYYY-MM-DD.` };
    }
    if (field.type === "select") {
        return {
            type: "string",
            enum: field.options.map(({ value }) => value),
            description: `${field.label}, one of: ${field.options.map(({ value, label }) => `${value} (${label})`).join(", ")}.`,
        };
    }
    return { type: "string", description: field.label };
}

function checkValue(field: ValueField, value: unknown) {
    if (typeof value !== "string") {
        return `"${field.name}" must be a string.`;
    }
    if (field.type === "date" && !datePattern.test(value)) {
        return `"${field.name}" must be a date in the format YYYY-MM-DD, but is "${value}".`;
    }
    if (field.type === "select" && !field.options.some((option) => option.value === value)) {
        return `"${field.name}" must be one of: ${field.options.map((option) => option.value).join(", ")}, but is "${value}".`;
    }
    return null;
}

/**
 * The tools of an entity's create or edit form: `get_<entity>_form_state`, `set_<entity>_form_values`, and for a form with
 * a blocks field, `edit_<entity>_form_blocks`. Like `edit_blocks`, they change the form as unsaved changes, which the user saves.
 */
export function createFormTools({
    entityName,
    entityLabel,
    fields,
    form,
    blockContext,
    isBlockInsertable = () => true,
}: {
    /** Names the tools, in snake case, e.g. "news" or "product_variant". */
    entityName: string;
    /** Names the entity in the tool descriptions, e.g. "news article". */
    entityLabel: string;
    fields: AiModeFormField[];
    form: FormApi<Record<string, unknown>>;
    blockContext: BlockContext;
    /** Whether a block may be inserted in the current content scope, as `isBlockSupported` of the blocks config decides. */
    isBlockInsertable?: (block: BlockInterface) => boolean;
}): AiModeTool[] {
    const settableFields = fields.filter((field): field is ValueField => field.type !== "block" && field.type !== "blocks");
    const blockFields = fields.filter((field) => field.type === "block" || field.type === "blocks");
    const blocksFields = fields.filter((field): field is BlocksField => field.type === "blocks");

    return [
        {
            name: `get_${entityName}_form_state`,
            description:
                `Get the live state of the ${entityLabel} form open in the admin: the value of every field, including unsaved changes, which fields the user changed, and which are invalid. ` +
                `The fields are: ${fields.map(({ name, label }) => `${name} (${label})`).join(", ")}. ${
                    blockFields.length > 0
                        ? `The block fields (${blockFields.map(({ name }) => name).join(", ")}) are summarized: their structure, text, files, and links. `
                        : ""
                }To change the fields, use set_${entityName}_form_values.`,
            inputSchema: { type: "object", properties: {} },
            readOnlyHint: true,
            handler: () => {
                const { values, dirtyFields, errors = {} } = form.getState();
                return {
                    values: Object.fromEntries(
                        fields.map((field) => [
                            field.name,
                            field.type === "block" || field.type === "blocks"
                                ? summarizeBlockState(field.block, values[field.name])
                                : values[field.name],
                        ]),
                    ),
                    changedFields: Object.keys(dirtyFields).filter((name) => dirtyFields[name]),
                    invalidFields: Object.keys(errors),
                };
            },
        },
        {
            name: `set_${entityName}_form_values`,
            description:
                `Change fields of the ${entityLabel} form open in the admin. Use this whenever the user asks for a field of the ${entityLabel} to be written or changed, e.g. to write a title or pick a category, rather than writing the value into the chat. ` +
                `The chat asks the user to approve every call before it runs, so call the tool instead of asking for permission in the chat first. ` +
                `The values are set as unsaved changes, exactly as if the user had typed them, so the user sees them in the form, and saves or discards them; afterwards, tell the user briefly what was changed and that it still has to be saved. ` +
                `Pass only the fields to change. All of them are set, or none is when one doesn't fit.${
                    blockFields.length > 0
                        ? ` The block fields (${blockFields.map(({ name }) => name).join(", ")}) can't be changed with this tool.`
                        : ""
                }${blocksFields.length > 0 ? ` Change the blocks of ${blocksFields.map(({ name }) => name).join(", ")} with edit_${entityName}_form_blocks.` : ""}`,
            inputSchema: {
                type: "object",
                properties: {
                    values: {
                        type: "object",
                        properties: Object.fromEntries(settableFields.map((field) => [field.name, getValueSchema(field)])),
                        additionalProperties: false,
                        description: "The new values, by field name.",
                    },
                },
                required: ["values"],
            },
            readOnlyHint: false,
            handler: (args) => {
                const values = args.values;
                if (typeof values !== "object" || values === null || Array.isArray(values)) {
                    throw new Error(`set_${entityName}_form_values requires "values", an object of the new values by field name.`);
                }

                const entries = Object.entries(values);
                const problems = entries.map(([name, value]) => {
                    const field = settableFields.find((candidate) => candidate.name === name);
                    if (!field) {
                        return `"${name}" is no field this tool can set. It can set: ${settableFields.map((candidate) => candidate.name).join(", ")}.`;
                    }
                    return checkValue(field, value);
                });
                const problem = problems.find((candidate) => candidate !== null);
                if (problem) {
                    throw new Error(`${problem} No field was changed.`);
                }

                form.batch(() => {
                    for (const [name, value] of entries) {
                        form.change(name, value);
                    }
                });

                return `Set ${entries.map(([name]) => name).join(", ")} in the ${entityLabel} form. The changes are unsaved — the user has to save the form.`;
            },
        },
        ...(blocksFields.length > 0 ? [createEditBlocksTool({ entityName, entityLabel, blocksFields, form, blockContext, isBlockInsertable })] : []),
    ];
}

function createEditBlocksTool({
    entityName,
    entityLabel,
    blocksFields,
    form,
    blockContext,
    isBlockInsertable,
}: {
    entityName: string;
    entityLabel: string;
    blocksFields: BlocksField[];
    form: FormApi<Record<string, unknown>>;
    blockContext: BlockContext;
    isBlockInsertable: (block: BlockInterface) => boolean;
}): AiModeTool {
    const stateToolName = `get_${entityName}_form_state`;

    return {
        name: `edit_${entityName}_form_blocks`,
        description:
            `Change the blocks of a block field of the ${entityLabel} form open in the admin (${blocksFields.map(({ name, label }) => `${name} (${label})`).join(", ")}): insert, update, remove, move, hide, and show its blocks. ` +
            `Use this tool whenever the user asks for anything in that content to be written, changed, or rearranged, rather than writing the new text into the chat. ` +
            `The chat asks the user to approve every call before it runs, so call the tool instead of asking for permission in the chat first. ` +
            `A request about 'this text' is about the text in the context's 'selection': change only that part of the block's text and keep the rest. ` +
            `The changes are applied as unsaved changes, exactly as if the user had made them by hand; afterwards, tell the user briefly what was changed and that the form still has to be saved. ` +
            `Typical flow: ${stateToolName} for the keys and types of the blocks, get_block_schema for the fields of the blocks to change, then one call of this tool. ${describeBlockEditBatch(
                { stateToolName },
            )}${blocksFields
                .map(
                    ({ name, schemaBlockName }) =>
                        `The field '${name}' is the '${schemaBlockName}' block. ${describeBlockSchemaLookup({ schemaRootBlockName: schemaBlockName, stateToolName })}.`,
                )
                .join(" ")} Only the top-level blocks of the field can be edited.`,
        inputSchema: {
            type: "object",
            properties: {
                field: { type: "string", enum: blocksFields.map(({ name }) => name), description: "The block field to change." },
                operations: blockEditOperationsSchema,
            },
            required: ["field", "operations"],
        },
        readOnlyHint: false,
        handler: async (args, { clearTextSelection }) => {
            const field = blocksFields.find((candidate) => candidate.name === args.field);
            if (!field) {
                throw new Error(
                    `"${String(args.field)}" is no block field this tool can change. It can change: ${blocksFields.map(({ name }) => name).join(", ")}.`,
                );
            }

            const plannedBlocks = (form.getState().values[field.name] as BlocksState).blocks;
            const { apply, results } = await planBlockEdits({
                blocks: plannedBlocks,
                operations: asBlockEditOperations(args.operations),
                supportedBlocks: field.supportedBlocks,
                insertableBlocks: Object.fromEntries(Object.entries(field.supportedBlocks).filter(([, block]) => isBlockInsertable(block))),
                schemaRootBlockName: field.schemaBlockName,
                blockContext,
            });

            if (apply) {
                // Planning awaits conversions that can query the API. Applied to blocks the user changed meanwhile, the batch
                // would undo those changes, so it is rejected as a whole instead.
                const current = form.getState().values[field.name] as BlocksState;
                if (current.blocks !== plannedBlocks) {
                    throw new Error(
                        `The field '${field.name}' changed while the edits were prepared, so none of the operations were applied. Read the form state again and retry.`,
                    );
                }
                form.change(field.name, { ...current, blocks: apply(current.blocks) });
            }

            const { changes, ...result } = describeBlockEditResults({ results, unsavedIn: `the field '${field.name}' of the ${entityLabel}` });
            if (changes > 0) {
                // The selection is the text before the change. The user selects again to ask about the new text.
                clearTextSelection();
            }
            return result;
        },
    };
}
