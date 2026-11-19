import { type FormApi, getIn, setIn } from "final-form";

import type { BlockContext } from "../blocks/context/BlockContext";
import type { BlockInterface } from "../blocks/types";
import type { AiModeTool } from "./AiModeScopes";
import { blockEditOperationsSchema, describeBlockEditBatch, describeBlockEditResults, describeBlockSchemaLookup } from "./blockEditTool";
import { type BlocksBlockChild, mergeBlockProps, toBlockState } from "./blockProps";
import { summarizeBlockState } from "./blockStateSummary";
import { asBlockEditOperations, planBlockEdits } from "./editBlocks";

type FormValues = Record<string, unknown>;

type ReferenceOption = Record<string, unknown> & { id: string };

/** A field of a form the AI Mode reads, and except for a single block, also changes. */
export type AiModeFormField = {
    /** The field's name in the form, also a nested one, e.g. "address.street". */
    name: string;
    label: string;
    /** What the agent needs to know to fill the field in that its type and label don't say, e.g. the format of a number. */
    description?: string;
} & (
    | { type: "text" }
    | { type: "date" }
    | { type: "boolean" }
    | { type: "select"; options: Array<{ value: string; label: string }> }
    | { type: "multiSelect"; options: Array<{ value: string; label: string }> }
    /**
     * A select of other entities, such as `AsyncSelectField`, whose value is the selected option object, or a list of
     * them. The agent lists the options with `get_<entity>_form_options` and sets the field by their IDs.
     */
    | {
          type: "reference";
          multiple?: boolean;
          /** Loads the options, as the field does. Receives the form values, which some options depend on. */
          loadOptions: (values: FormValues) => Promise<ReferenceOption[]>;
          getOptionLabel: (option: ReferenceOption) => string;
      }
    /** A block the agent can read but not change, e.g. an image. */
    /**
     * A single block, e.g. an image or a link. With its name in block-meta, the agent sets it in the shape it is saved in,
     * merged into its current content; without it, the agent can only read it.
     */
    | { type: "block"; block: BlockInterface; schemaBlockName?: string }
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

type SettableField = Exclude<AiModeFormField, { type: "blocks" }>;
type ReferenceField = Extract<AiModeFormField, { type: "reference" }>;
type BlocksField = Extract<AiModeFormField, { type: "blocks" }>;
type BlocksState = { blocks: BlocksBlockChild[] };

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const isSettable = (field: AiModeFormField): field is SettableField =>
    field.type !== "blocks" && (field.type !== "block" || field.schemaBlockName !== undefined);

const describeOptions = (options: Array<{ value: string; label: string }>) => options.map(({ value, label }) => `${value} (${label})`).join(", ");

function getValueSchema(field: SettableField, entityName: string): Record<string, unknown> {
    const describe = (text: string) => [`${field.label}, ${text}`, field.description].filter(Boolean).join(" ");

    switch (field.type) {
        case "block":
            return {
                type: "object",
                description: describe(
                    `the block's fields in the shape it is saved in, as get_block_schema describes the '${field.schemaBlockName}' block. Fields left out keep their current value, nested fields included; a list replaces the current one.`,
                ),
            };
        case "date":
            return { type: "string", description: describe("as a date in the format YYYY-MM-DD.") };
        case "boolean":
            return { type: "boolean", description: describe("true or false.") };
        case "select":
            return {
                type: "string",
                enum: field.options.map(({ value }) => value),
                description: describe(`one of: ${describeOptions(field.options)}.`),
            };
        case "multiSelect":
            return {
                type: "array",
                items: { type: "string", enum: field.options.map(({ value }) => value) },
                description: describe(`a list of: ${describeOptions(field.options)}. The list replaces the current one.`),
            };
        case "reference":
            return field.multiple
                ? {
                      type: "array",
                      items: { type: "string" },
                      description: describe(
                          `a list of the IDs of options that get_${entityName}_form_options lists. The list replaces the current one.`,
                      ),
                  }
                : {
                      type: ["string", "null"],
                      description: describe(`the ID of an option that get_${entityName}_form_options lists, or null to clear it.`),
                  };
        default:
            return { type: "string", description: describe("a text.") };
    }
}

/** Checks a value and converts it to the form's value, or returns why it doesn't fit. */
async function toFormValue(
    field: SettableField,
    value: unknown,
    { values, entityName, blockContext }: { values: FormValues; entityName: string; blockContext: BlockContext },
): Promise<{ value: unknown } | { problem: string }> {
    const options = "options" in field ? field.options.map((option) => option.value) : [];

    switch (field.type) {
        case "block": {
            if (typeof value !== "object" || value === null || Array.isArray(value)) {
                return { problem: `"${field.name}" must be an object of the block's fields.` };
            }
            const schemaBlockName = field.schemaBlockName as string;
            // Merged into the current content, so that the agent can change one field without restating the block.
            const props = mergeBlockProps(field.block.state2Output(getIn(values, field.name)), value as Record<string, unknown>);
            try {
                const { state } = await toBlockState({
                    block: field.block,
                    type: schemaBlockName,
                    schemaRootBlockName: schemaBlockName,
                    props,
                    givenFields: Object.keys(value),
                    blockContext,
                    schemaLookup: `call get_block_schema for "${schemaBlockName}"`,
                });
                return { value: state };
            } catch (error) {
                return { problem: `"${field.name}": ${error instanceof Error ? error.message : String(error)}` };
            }
        }
        case "boolean":
            return typeof value === "boolean" ? { value } : { problem: `"${field.name}" must be true or false.` };
        case "multiSelect":
            if (!Array.isArray(value) || !value.every((item) => typeof item === "string" && options.includes(item))) {
                return { problem: `"${field.name}" must be a list of: ${options.join(", ")}.` };
            }
            return { value };
        case "reference": {
            if (!field.multiple && value === null) {
                return { value: null };
            }
            const ids = field.multiple ? value : [value];
            if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
                return { problem: `"${field.name}" must be ${field.multiple ? "a list of IDs" : "an ID or null"}.` };
            }
            const loadedOptions = await field.loadOptions(values);
            const selected = ids.map((id) => loadedOptions.find((option) => option.id === id));
            const unknownIndex = selected.findIndex((option) => option === undefined);
            if (unknownIndex !== -1) {
                return { problem: `"${ids[unknownIndex]}" is no option of "${field.name}". List the options with get_${entityName}_form_options.` };
            }
            return { value: field.multiple ? selected : selected[0] };
        }
        default:
            break;
    }

    if (typeof value !== "string") {
        return { problem: `"${field.name}" must be a string.` };
    }
    if (field.type === "date" && !datePattern.test(value)) {
        return { problem: `"${field.name}" must be a date in the format YYYY-MM-DD, but is "${value}".` };
    }
    if (field.type === "select" && !options.includes(value)) {
        return { problem: `"${field.name}" must be one of: ${options.join(", ")}, but is "${value}".` };
    }
    return { value };
}

/** The value as the agent reads it: a summary for a block, the ID and label of a selected option. */
function summarizeValue(field: AiModeFormField, value: unknown) {
    if (field.type === "block" || field.type === "blocks") {
        return summarizeBlockState(field.block, value);
    }
    if (field.type === "reference") {
        const summarizeOption = (option: ReferenceOption) => ({ id: option.id, label: field.getOptionLabel(option) });
        if (Array.isArray(value)) {
            return value.map(summarizeOption);
        }
        return value ? summarizeOption(value as ReferenceOption) : null;
    }
    return value;
}

/**
 * The tools of an entity's create or edit form: `get_<entity>_form_state` and `set_<entity>_form_values`, for a form with a
 * reference field `get_<entity>_form_options`, and for a form with a blocks field `edit_<entity>_form_blocks`. Like
 * `edit_blocks`, they change the form as unsaved changes, which the user saves.
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
    form: FormApi<FormValues>;
    blockContext: BlockContext;
    /** Whether a block may be inserted in the current content scope, as `isBlockSupported` of the blocks config decides. */
    isBlockInsertable?: (block: BlockInterface) => boolean;
}): AiModeTool[] {
    const settableFields = fields.filter(isSettable);
    const blockFields = fields.filter((field) => field.type === "block" || field.type === "blocks");
    const readOnlyFields = fields.filter((field) => !isSettable(field) && field.type !== "blocks");
    const blocksFields = fields.filter((field): field is BlocksField => field.type === "blocks");
    const referenceFields = fields.filter((field): field is ReferenceField => field.type === "reference");
    const listNames = (list: AiModeFormField[]) => list.map(({ name }) => name).join(", ");

    return [
        {
            name: `get_${entityName}_form_state`,
            description:
                `Get the live state of the ${entityLabel} form open in the admin: the value of every field, including unsaved changes, which fields the user changed, and which are invalid. ` +
                `The fields are: ${fields.map(({ name, label }) => `${name} (${label})`).join(", ")}. ${
                    blockFields.length > 0
                        ? `The block fields (${listNames(blockFields)}) are summarized: their structure, text, files, and links. `
                        : ""
                }${
                    referenceFields.length > 0 ? `The fields ${listNames(referenceFields)} have the ID and label of the selected option. ` : ""
                }To change the fields, use set_${entityName}_form_values.`,
            inputSchema: { type: "object", properties: {} },
            readOnlyHint: true,
            handler: () => {
                const { values, dirtyFields, errors = {} } = form.getState();
                return {
                    values: Object.fromEntries(fields.map((field) => [field.name, summarizeValue(field, getIn(values, field.name))])),
                    changedFields: Object.keys(dirtyFields).filter((name) => dirtyFields[name]),
                    invalidFields: Object.keys(errors),
                };
            },
        },
        ...(referenceFields.length > 0
            ? [
                  {
                      name: `get_${entityName}_form_options`,
                      description: `List the options of a field of the ${entityLabel} form that selects other entities (${listNames(referenceFields)}), with their IDs and labels, to set the field with set_${entityName}_form_values.`,
                      inputSchema: {
                          type: "object",
                          properties: { field: { type: "string", enum: referenceFields.map(({ name }) => name) } },
                          required: ["field"],
                      },
                      readOnlyHint: true,
                      handler: async (args: Record<string, unknown>) => {
                          const field = referenceFields.find((candidate) => candidate.name === args.field);
                          if (!field) {
                              throw new Error(`"${String(args.field)}" is no field with options. These have: ${listNames(referenceFields)}.`);
                          }
                          const options = await field.loadOptions(form.getState().values);
                          return options.map((option) => ({ id: option.id, label: field.getOptionLabel(option) }));
                      },
                  } satisfies AiModeTool,
              ]
            : []),
        {
            name: `set_${entityName}_form_values`,
            description:
                `Change fields of the ${entityLabel} form open in the admin. Use this whenever the user asks for a field of the ${entityLabel} to be written or changed, e.g. to write a title or pick a category, rather than writing the value into the chat. ` +
                `The chat asks the user to approve every call before it runs, so call the tool instead of asking for permission in the chat first. ` +
                `The values are set as unsaved changes, exactly as if the user had typed them, so the user sees them in the form, and saves or discards them; afterwards, tell the user briefly what was changed and that it still has to be saved. ` +
                `Pass only the fields to change. All of them are set, or none is when one doesn't fit.${
                    readOnlyFields.length > 0 ? ` The fields ${listNames(readOnlyFields)} can't be changed.` : ""
                }${blocksFields.length > 0 ? ` Change the blocks of ${listNames(blocksFields)} with edit_${entityName}_form_blocks.` : ""}`,
            inputSchema: {
                type: "object",
                properties: {
                    values: {
                        type: "object",
                        properties: Object.fromEntries(settableFields.map((field) => [field.name, getValueSchema(field, entityName)])),
                        additionalProperties: false,
                        description: "The new values, by field name.",
                    },
                },
                required: ["values"],
            },
            readOnlyHint: false,
            handler: async (args) => {
                const values = args.values;
                if (typeof values !== "object" || values === null || Array.isArray(values)) {
                    throw new Error(`set_${entityName}_form_values requires "values", an object of the new values by field name.`);
                }

                const entries = Object.entries(values);
                const unknownName = entries.map(([name]) => name).find((name) => !settableFields.some((field) => field.name === name));
                if (unknownName !== undefined) {
                    throw new Error(
                        `"${unknownName}" is no field this tool can set. It can set: ${listNames(settableFields)}. No field was changed.`,
                    );
                }

                // The options of a reference field may depend on other fields of the same call, e.g. the manufacturers on
                // the country. The values are therefore converted in the order of the fields, and each reference loads its
                // options with the values converted before it.
                let proposedValues = form.getState().values;
                const formValues: Array<[string, unknown]> = [];
                for (const field of settableFields) {
                    if (!(field.name in values)) {
                        continue;
                    }
                    const result = await toFormValue(field, (values as FormValues)[field.name], { values: proposedValues, entityName, blockContext });
                    if ("problem" in result) {
                        throw new Error(`${result.problem} No field was changed.`);
                    }
                    formValues.push([field.name, result.value]);
                    proposedValues = setIn(proposedValues, field.name, result.value) as FormValues;
                }

                form.batch(() => {
                    for (const [name, value] of formValues) {
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
    form: FormApi<FormValues>;
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

            const plannedBlocks = (getIn(form.getState().values, field.name) as BlocksState).blocks;
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
                const current = getIn(form.getState().values, field.name) as BlocksState;
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
