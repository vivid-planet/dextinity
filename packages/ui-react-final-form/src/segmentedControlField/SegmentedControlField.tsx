import { SegmentedControl, type SegmentedControlProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface SegmentedControlFieldProps<Value extends string = string, FieldValue = Value>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, Value>,
        Omit<SegmentedControlProps<Value>, "value" | "onChange" | "onBlur" | "state" | "validationMessage"> {}

/**
 * A `SegmentedControl` connected to a React Final Form field holding one of the options' values. Without a value, no option is pressed.
 * Shows the field's error below the control once it was touched or the form was submitted.
 */
export const SegmentedControlField = forwardRef(function SegmentedControlField<Value extends string = string, FieldValue = Value>(
    { name, onFocus, ...props }: SegmentedControlFieldProps<Value, FieldValue>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, Value, HTMLDivElement>(name, options, forwardedRef);

    return (
        <SegmentedControl<Value>
            {...controlProps}
            ref={ref}
            value={input.value ?? ("" as Value)}
            {...validationProps}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <Value extends string = string, FieldValue = Value>(
    props: SegmentedControlFieldProps<Value, FieldValue> & RefAttributes<HTMLDivElement>,
) => ReactNode;
