import { Field, SegmentedControl, type SegmentedControlProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface SegmentedControlFieldProps<Value extends string = string, FieldValue = Value>
    extends
        FieldAdapterBaseProps,
        FieldAdapterFieldProps,
        FinalFormFieldConfig<FieldValue, Value>,
        Omit<SegmentedControlProps<Value>, "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage"> {}

/**
 * A `SegmentedControl` connected to a React Final Form field holding one of the options' values. Without a value, no option is checked.
 * Shows the field's error below the control once it was touched or the form was submitted.
 */
export const SegmentedControlField = memo(
    forwardRef(function SegmentedControlField<Value extends string = string, FieldValue = Value>(
        { name, onFocus, ...props }: SegmentedControlFieldProps<Value, FieldValue>,
        forwardedRef: ForwardedRef<HTMLDivElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, segmentedControlProps] = splitFieldProps(controlProps, groupFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, Value, HTMLDivElement>(name, options, forwardedRef);

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
                <SegmentedControl<Value> {...segmentedControlProps} ref={ref} value={input.value ?? ("" as Value)} onChange={input.onChange} />
            </Field>
        );
    }),
) as <Value extends string = string, FieldValue = Value>(
    props: SegmentedControlFieldProps<Value, FieldValue> & RefAttributes<HTMLDivElement>,
) => ReactNode;
