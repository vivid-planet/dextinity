import { Select, type SelectProps, type SelectValue } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface SelectFieldProps<Multiple extends boolean = false, FieldValue = SelectValue<Multiple>>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, SelectValue<Multiple>>,
        Omit<SelectProps<Multiple>, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<SelectValue<Multiple>>;
}

export function toSelectValue<Multiple extends boolean>(value: unknown, multiple: boolean): SelectValue<Multiple> {
    if (multiple) {
        return (Array.isArray(value) ? value : value == null || value === "" ? [] : [value]) as SelectValue<Multiple>;
    }
    return (value == null || value === "" ? null : value) as SelectValue<Multiple>;
}

/**
 * A `Select` connected to a React Final Form field: a value or `null` for nothing chosen, a list with `multiple`. Shows the field's error
 * once it was touched or the form was submitted.
 */
export const SelectField = forwardRef(function SelectField<Multiple extends boolean = false, FieldValue = SelectValue<Multiple>>(
    { name, actions, onFocus, ...props }: SelectFieldProps<Multiple, FieldValue>,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
) {
    const [options, selectProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, SelectValue<Multiple>, HTMLButtonElement>(name, options, forwardedRef);
    const value = toSelectValue<Multiple>(input.value, selectProps.multiple === true);

    return (
        <Select<Multiple>
            {...selectProps}
            {...validationProps}
            ref={ref}
            name={input.name}
            value={value}
            required={options.required}
            actions={renderActions(actions, value, input.onChange)}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <Multiple extends boolean = false, FieldValue = SelectValue<Multiple>>(
    props: SelectFieldProps<Multiple, FieldValue> & RefAttributes<HTMLButtonElement>,
) => ReactNode;
