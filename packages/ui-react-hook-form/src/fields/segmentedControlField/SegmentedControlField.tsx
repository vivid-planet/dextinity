import { Field, SegmentedControl, type SegmentedControlProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface SegmentedControlFieldProps<
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        FieldAdapterFieldProps,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<SegmentedControlProps<Value>, "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage"> {}

/**
 * A `SegmentedControl` connected to a React Hook Form field holding one of the options' values. Without a value, no option is checked.
 * Shows the field's error below the control once it was touched or the form was submitted.
 */
export const SegmentedControlField = forwardRef(function SegmentedControlField<
    Value extends string,
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({ name, onFocus, ...props }: SegmentedControlFieldProps<Value, TFieldValues, TName>, forwardedRef: ForwardedRef<HTMLDivElement>) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const [fieldProps, segmentedControlProps] = splitFieldProps(controlProps, groupFieldPropKeys);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <Field
            layout="group"
            {...fieldProps}
            required={options.required}
            {...validationProps}
            onBlur={(event) => {
                if (leavesField(event)) {
                    field.onBlur();
                }
            }}
            onFocus={onFocus}
        >
            <SegmentedControl<Value> {...segmentedControlProps} ref={ref} value={field.value ?? ("" as Value)} onChange={field.onChange} />
        </Field>
    );
}) as <
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: SegmentedControlFieldProps<Value, TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
