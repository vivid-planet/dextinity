import type { ReactNode } from "react";
import type { UseFieldConfig } from "react-final-form";

/**
 * The field-level configuration of React Final Form an adapter passes to `useField`: validation, parsing and formatting between the form
 * value and the control's value, and initial values. Plus `warn`, the adapters' own non-blocking validation.
 */
export type FinalFormFieldConfig<FieldValue, ControlValue> = FinalFormWarnConfig<FieldValue> &
    Pick<
        UseFieldConfig<FieldValue, ControlValue>,
        | "afterSubmit"
        | "allowNull"
        | "beforeSubmit"
        | "data"
        | "defaultValue"
        | "format"
        | "formatOnBlur"
        | "initialValue"
        | "isEqual"
        | "parse"
        | "validate"
        | "validateFields"
    >;

interface FinalFormWarnConfig<FieldValue> {
    /**
     * Returns a warning for the field's value, shown as `state="warning"` without blocking submitting, e.g. a text longer than
     * recommended. A warning set as `meta.data.warning`, e.g. by a form decorator with cross-field rules, takes precedence.
     */
    warn?: (value: FieldValue) => ReactNode;
}
