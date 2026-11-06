import { Checkbox, type CheckboxProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";
import { useValidationMessage } from "../field/useValidationMessage";

export interface CheckboxFieldProps<FieldValue = boolean | string[]>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, boolean | string[]>,
        Omit<CheckboxProps, "name" | "checked" | "onChange" | "onBlur" | "required" | "defaultValue" | "defaultChecked"> {
    /** Makes the checkbox one of a group: the field holds the list of the checked boxes' values, and this box adds or removes its own. */
    value?: string;
}

export function isCheckboxChecked(fieldValue: unknown, value: string | undefined) {
    return value === undefined ? fieldValue === true : Array.isArray(fieldValue) && fieldValue.includes(value);
}

export function toggleCheckboxValue(fieldValue: unknown, value: string | undefined, checked: boolean): boolean | string[] {
    if (value === undefined) {
        return checked;
    }
    const values: string[] = Array.isArray(fieldValue) ? fieldValue.filter((item) => item !== value) : [];
    return checked ? [...values, value] : values;
}

/**
 * A `Checkbox` connected to a React Final Form field: a boolean, or – with `value` – one entry of a list. A required checkbox must be
 * checked. Shows the field's error below the checkbox once it was touched or the form was submitted.
 */
export const CheckboxField = forwardRef(function CheckboxField<FieldValue = boolean | string[]>(
    { name, value, onFocus, "aria-describedby": ariaDescribedBy, ...props }: CheckboxFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLLabelElement>,
) {
    const [options, checkboxProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, boolean | string[], HTMLLabelElement>(name, options, forwardedRef);
    const { message, describedBy } = useValidationMessage(validationProps, ariaDescribedBy);

    return (
        <>
            <Checkbox
                {...checkboxProps}
                ref={ref}
                name={input.name}
                value={value}
                checked={isCheckboxChecked(input.value, value)}
                required={options.required}
                aria-describedby={describedBy}
                onChange={(checked) => input.onChange(toggleCheckboxValue(input.value, value, checked))}
                onBlur={onBlur}
                onFocus={(event) => {
                    onFieldFocus();
                    onFocus?.(event);
                }}
            />
            {message}
        </>
    );
}) as <FieldValue = boolean | string[]>(props: CheckboxFieldProps<FieldValue> & RefAttributes<HTMLLabelElement>) => ReactNode;
