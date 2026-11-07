import type { ReactNode } from "react";

/**
 * What an adapter's `actions` function receives: the field's current value and a setter, e.g. for `FieldActions` to apply an AI
 * suggestion.
 */
export interface FieldAdapterActionsContext<Value> {
    /** The current value of the control. */
    value: Value;
    /** Changes the field's value, as if the user had changed it. */
    setValue: (value: Value) => void;
}

/**
 * Props every field adapter takes, in addition to the props of its `@dextinity/ui` component.
 */
export interface FieldAdapterBaseProps {
    /** The field's path in the form values, e.g. `title` or `seo.description`. */
    name: string;
    /**
     * Marks the field as required and validates that it has a value: not empty, not `false`, not an empty list.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /**
     * The message shown when a required field is empty.
     *
     * @defaultValue `"Required"`
     */
    requiredMessage?: ReactNode;
}

/**
 * The `actions` prop of the adapters whose control has a field frame: content at the label, or a function of the field's value and
 * setter, e.g. to connect `FieldActions`.
 */
export type FieldAdapterActions<Value> = ReactNode | ((context: FieldAdapterActionsContext<Value>) => ReactNode);
