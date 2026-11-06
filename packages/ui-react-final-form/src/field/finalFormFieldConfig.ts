import type { UseFieldConfig } from "react-final-form";

/**
 * The field-level configuration of React Final Form an adapter passes to `useField`: validation, parsing and formatting between the form
 * value and the control's value, and initial values.
 */
export type FinalFormFieldConfig<FieldValue, ControlValue> = Pick<
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
