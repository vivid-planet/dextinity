import { Field, Select, type SelectProps, type SelectValue } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { defaultValueKey, isEqualByKey } from "../../fieldAdapter/isEqualByKey";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface SelectFieldProps<Multiple extends boolean = false, Value = string, FieldValue = SelectValue<Multiple, Value>>
    extends
        FieldAdapterBaseProps,
        FieldAdapterBoxFieldProps,
        FinalFormFieldConfig<FieldValue, SelectValue<Multiple, Value>>,
        Omit<
            SelectProps<Multiple, Value>,
            "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"
        > {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<SelectValue<Multiple, Value>>;
}

export function toSelectValue<Multiple extends boolean, Value = string>(value: unknown, multiple: boolean): SelectValue<Multiple, Value> {
    if (multiple) {
        return (Array.isArray(value) ? value : value == null || value === "" ? [] : [value]) as SelectValue<Multiple, Value>;
    }
    return (value == null || value === "" ? null : value) as SelectValue<Multiple, Value>;
}

/**
 * A `Select` connected to a React Final Form field: a value of any type or `null` for nothing chosen, a list with `multiple`. Shows the field's error
 * once it was touched or the form was submitted. Without `isEqual`, `parse`, and `format`, the field compares values by `getKey`, so choosing
 * the same values again, e.g. as a new list, doesn't make it dirty.
 */
export const SelectField = memo(
    forwardRef(function SelectField<Multiple extends boolean = false, Value = string, FieldValue = SelectValue<Multiple, Value>>(
        { name, actions, onFocus, ...props }: SelectFieldProps<Multiple, Value, FieldValue>,
        forwardedRef: ForwardedRef<HTMLButtonElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, selectProps] = splitFieldProps(controlProps, boxFieldPropKeys);
        const isEqual =
            options.isEqual ?? (options.parse == null && options.format == null ? isEqualByKey(selectProps.getKey ?? defaultValueKey) : undefined);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, SelectValue<Multiple, Value>, HTMLButtonElement>(name, { ...options, isEqual }, forwardedRef);
        const value = toSelectValue<Multiple, Value>(input.value, selectProps.multiple === true);

        return (
            <Field
                {...fieldProps}
                {...validationProps}
                required={options.required}
                actions={renderActions(actions, value, input.onChange)}
                onBlur={(event) => {
                    if (leavesField(event)) {
                        onBlur();
                    }
                }}
                onFocus={(event) => {
                    onFieldFocus();
                    onFocus?.(event);
                }}
            >
                <Select<Multiple, Value> {...selectProps} ref={ref} name={input.name} value={value} onChange={input.onChange} />
            </Field>
        );
    }),
) as <Multiple extends boolean = false, Value = string, FieldValue = SelectValue<Multiple, Value>>(
    props: SelectFieldProps<Multiple, Value, FieldValue> & RefAttributes<HTMLButtonElement>,
) => ReactNode;
