import { Checkbox, type CheckboxProps, Field } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface CheckboxFieldProps<FieldValue = boolean | string[]>
    extends
        FieldAdapterBaseProps,
        FieldAdapterFieldProps,
        FinalFormFieldConfig<FieldValue, boolean | string[]>,
        Omit<
            CheckboxProps,
            "name" | "checked" | "onChange" | "onBlur" | "onFocus" | "required" | "defaultValue" | "defaultChecked" | "state" | "validationMessage"
        > {
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
export const CheckboxField = memo(
    forwardRef(function CheckboxField<FieldValue = boolean | string[]>(
        { name, value, onFocus, ...props }: CheckboxFieldProps<FieldValue>,
        forwardedRef: ForwardedRef<HTMLDivElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, checkboxProps] = splitFieldProps(controlProps, groupFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, boolean | string[], HTMLDivElement>(name, options, forwardedRef);

        return (
            <Field
                layout="group"
                {...fieldProps}
                required={options.required}
                {...validationProps}
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
                <Checkbox
                    {...checkboxProps}
                    ref={ref}
                    name={input.name}
                    value={value}
                    checked={isCheckboxChecked(input.value, value)}
                    onChange={(checked) => input.onChange(toggleCheckboxValue(input.value, value, checked))}
                />
            </Field>
        );
    }),
) as <FieldValue = boolean | string[]>(props: CheckboxFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
