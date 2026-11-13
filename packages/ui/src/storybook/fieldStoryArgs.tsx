import type { ArgTypes } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { Field, type FieldLayout, type FieldProps } from "../components/field/Field";

const fieldArgNames = [
    "label",
    "required",
    "helpText",
    "helperText",
    "validationMessage",
    "state",
    "disabled",
    "readOnly",
    "loading",
    "size",
    "prefix",
    "suffix",
    "actions",
] as const;

/**
 * The args of a control's story that belong to the `Field` around the control.
 */
export type FieldStoryArgs = Partial<Pick<FieldProps, (typeof fieldArgNames)[number]>>;

const fieldCategory = { category: "Field" };

/**
 * The `argTypes` of the field args, listed in their own "Field" section of the props table.
 */
export const fieldArgTypes = {
    label: { control: "text", table: fieldCategory },
    required: { control: "boolean", table: fieldCategory },
    helpText: { control: "text", table: fieldCategory },
    helperText: { control: "text", table: fieldCategory },
    validationMessage: { control: "text", table: fieldCategory },
    state: { control: "select", options: ["default", "success", "warning", "error"], table: fieldCategory },
    disabled: { control: "boolean", table: fieldCategory },
    readOnly: { control: "boolean", table: fieldCategory },
    loading: { control: "boolean", table: fieldCategory },
    size: { control: "radio", options: ["small", "default", "large"], table: fieldCategory },
    prefix: { control: false, table: fieldCategory },
    suffix: { control: false, table: fieldCategory },
    actions: { control: false, table: fieldCategory },
} satisfies ArgTypes;

/**
 * The field args that apply to a `Field` with `layout="group"`, which draws no box.
 */
export const groupFieldArgTypes = {
    label: fieldArgTypes.label,
    required: fieldArgTypes.required,
    helpText: fieldArgTypes.helpText,
    helperText: fieldArgTypes.helperText,
    validationMessage: fieldArgTypes.validationMessage,
    state: fieldArgTypes.state,
    disabled: fieldArgTypes.disabled,
    readOnly: fieldArgTypes.readOnly,
} satisfies ArgTypes;

/**
 * Splits a story's args into the props of the `Field` and those of the control. `controlArgNames` stay with the control, e.g. a `size`
 * of the control's own.
 */
export function splitFieldArgs<Args extends FieldStoryArgs>(args: Args, controlArgNames: ReadonlyArray<keyof FieldStoryArgs> = []) {
    const field: FieldStoryArgs = {};
    const control: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(args)) {
        if ((fieldArgNames as readonly string[]).includes(name) && !(controlArgNames as readonly string[]).includes(name)) {
            (field as Record<string, unknown>)[name] = value;
        } else {
            control[name] = value;
        }
    }
    return { field, control: control as Omit<Args, keyof FieldStoryArgs> };
}

/**
 * Whether a story sets any of the field args.
 */
export function hasFieldArgs(field: FieldStoryArgs) {
    return Object.values(field).some((value) => value !== undefined && value !== false && value !== "");
}

/**
 * Renders a control in a `Field` with the field args of a story.
 */
export function StoryField({ field, layout, children }: { field: FieldStoryArgs; layout?: FieldLayout; children: ReactNode }) {
    return (
        <Field {...field} layout={layout}>
            {children}
        </Field>
    );
}
