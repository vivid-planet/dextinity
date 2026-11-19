import type { BlockInterface } from "@dextinity/cms-admin";
import type { FormApi } from "final-form";

import type { AiModeTool } from "./AiModeToolsets";
import { summarizeBlockState } from "./blockStateSummary";

/** A field of a form the AI Mode reads, and unless it is a block, also fills in. */
export type AiModeFormField = { name: string; label: string } & (
    | { type: "text" }
    | { type: "date" }
    | { type: "select"; options: Array<{ value: string; label: string }> }
    | { type: "block"; block: BlockInterface }
);

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function getValueSchema(field: Exclude<AiModeFormField, { type: "block" }>) {
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

function checkValue(field: Exclude<AiModeFormField, { type: "block" }>, value: unknown) {
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
 * The tools of an entity's create or edit form: `get_<entity>_form_state` and `set_<entity>_form_values`. Like
 * `edit_blocks`, the values are set as unsaved changes, which the user saves.
 */
export function createFormTools({
    entityName,
    entityLabel,
    fields,
    form,
}: {
    /** Names the tools, in snake case, e.g. "news" or "product_variant". */
    entityName: string;
    /** Names the entity in the tool descriptions, e.g. "news article". */
    entityLabel: string;
    fields: AiModeFormField[];
    form: FormApi<Record<string, unknown>>;
}): AiModeTool[] {
    const settableFields = fields.filter((field): field is Exclude<AiModeFormField, { type: "block" }> => field.type !== "block");
    const blockFields = fields.filter((field) => field.type === "block");

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
                            field.type === "block" ? summarizeBlockState(field.block, values[field.name]) : values[field.name],
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
                }`,
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
    ];
}
