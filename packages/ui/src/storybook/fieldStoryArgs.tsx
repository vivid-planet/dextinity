import type { ArgTypes } from "@storybook/react-vite";
import type { PropsWithChildren } from "react";
import type { InputType } from "storybook/internal/types";

import { Field, type FieldLayout, type FieldProps } from "../components/field/Field";
import { Icon } from "../components/icon/Icon";

const fieldArgNames = [
    "label",
    "required",
    "info",
    "description",
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

const adornmentOptions = {
    Domain: "example.com",
    Unit: "€ / year",
    Search: <Icon name="search" />,
};

const adornmentArgType = { control: "select", options: Object.keys(adornmentOptions), mapping: adornmentOptions } satisfies InputType;

/**
 * The `argTypes` of the field args, for the stories of `Field` itself.
 */
export const fieldPropArgTypes = {
    label: { control: "text" },
    required: { control: "boolean" },
    info: { control: "text" },
    description: { control: "text" },
    validationMessage: { control: "text" },
    state: { control: "select", options: ["default", "success", "warning", "error"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    loading: { control: "boolean" },
    size: { control: "radio", options: ["small", "default", "large"] },
    prefix: adornmentArgType,
    suffix: adornmentArgType,
    actions: { control: false },
} satisfies ArgTypes;

const fieldCategory = { category: "Field" };

/**
 * The `argTypes` of the field args, listed in their own "Field" section of a control's props table.
 */
export const fieldArgTypes = {
    label: { ...fieldPropArgTypes.label, table: fieldCategory },
    required: { ...fieldPropArgTypes.required, table: fieldCategory },
    info: { ...fieldPropArgTypes.info, table: fieldCategory },
    description: { ...fieldPropArgTypes.description, table: fieldCategory },
    validationMessage: { ...fieldPropArgTypes.validationMessage, table: fieldCategory },
    state: { ...fieldPropArgTypes.state, table: fieldCategory },
    disabled: { ...fieldPropArgTypes.disabled, table: fieldCategory },
    readOnly: { ...fieldPropArgTypes.readOnly, table: fieldCategory },
    loading: { ...fieldPropArgTypes.loading, table: fieldCategory },
    size: { ...fieldPropArgTypes.size, table: fieldCategory },
    prefix: { ...fieldPropArgTypes.prefix, table: fieldCategory },
    suffix: { ...fieldPropArgTypes.suffix, table: fieldCategory },
    actions: { ...fieldPropArgTypes.actions, table: fieldCategory },
} satisfies ArgTypes;

/**
 * The field args that apply to a `Field` with `layout="group"`, which draws no box.
 */
export const groupFieldArgTypes = {
    label: fieldArgTypes.label,
    required: fieldArgTypes.required,
    info: fieldArgTypes.info,
    description: fieldArgTypes.description,
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
export function StoryField({ field, layout, children }: PropsWithChildren<{ field: FieldStoryArgs; layout?: FieldLayout }>) {
    return (
        <Field {...field} layout={layout}>
            {children}
        </Field>
    );
}
