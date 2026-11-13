import type { FieldBaseProps, FieldProps } from "@dextinity/ui";
import type { CSSProperties, FocusEvent, FocusEventHandler } from "react";

/**
 * Props of the `Field` around an adapter's control: its label, help, and state.
 */
export interface FieldAdapterFieldProps extends Pick<FieldBaseProps, "label" | "helpText" | "helperText" | "disabled" | "readOnly"> {
    /** The control's id, which the field's label and message point to. */
    id?: string;
    /** Added alongside the field's own classes, on the root. */
    className?: string;
    /** Inline styles for the field's root. */
    style?: CSSProperties;
    /** Called when the focus moves into the field. */
    onFocus?: FocusEventHandler<HTMLDivElement>;
}

/**
 * Props of the `Field` around an adapter's control with a box, e.g. a `Select`: also its loading state, size, prefix, and suffix.
 */
export interface FieldAdapterBoxFieldProps extends FieldAdapterFieldProps, Pick<FieldBaseProps, "loading" | "size" | "prefix" | "suffix"> {}

export const groupFieldPropKeys = ["label", "helpText", "helperText", "disabled", "readOnly", "id", "className", "style"] as const;
export const boxFieldPropKeys = [...groupFieldPropKeys, "loading", "size", "prefix", "suffix"] as const;

type FieldFrameProps = Pick<
    FieldProps,
    "label" | "helpText" | "helperText" | "disabled" | "readOnly" | "controlId" | "className" | "style" | "loading" | "size" | "prefix" | "suffix"
>;

export function splitFieldProps<Props extends object, Key extends string>(props: Props, keys: readonly Key[]): [FieldFrameProps, Omit<Props, Key>] {
    const fieldProps: Record<string, unknown> = {};
    const rest: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
        if ((keys as readonly string[]).includes(key)) {
            fieldProps[key === "id" ? "controlId" : key] = value;
        } else {
            rest[key] = value;
        }
    }
    return [fieldProps as FieldFrameProps, rest as Omit<Props, Key>];
}

/**
 * Whether the focus leaves the field, rather than moving between the field's own elements, e.g. a group's options or the actions.
 */
export function leavesField(event: FocusEvent<HTMLElement>) {
    return !event.currentTarget.contains(event.relatedTarget as Node | null);
}
