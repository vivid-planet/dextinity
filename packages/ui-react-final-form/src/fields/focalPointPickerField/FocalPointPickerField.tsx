import { type FocalPoint, FocalPointPicker, type FocalPointPickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface FocalPointPickerFieldProps<FieldValue = FocalPoint>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, FocalPoint>,
        Omit<FocalPointPickerProps, "value" | "onChange" | "onBlur" | "defaultValue" | "state" | "validationMessage"> {}

const center: FocalPoint = { x: 0.5, y: 0.5 };

export function toFocalPoint(value: unknown): FocalPoint {
    if (value != null && typeof value === "object" && "x" in value && "y" in value) {
        return value as FocalPoint;
    }
    return center;
}

/**
 * A `FocalPointPicker` connected to a React Final Form field holding the focal point. Without a value, the marker rests in the center.
 * Shows the field's error below the picker once it was touched or the form was submitted.
 */
export const FocalPointPickerField = forwardRef(function FocalPointPickerField<FieldValue = FocalPoint>(
    { name, onFocus, ...props }: FocalPointPickerFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, pickerProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, FocalPoint, HTMLDivElement>(name, options, forwardedRef);

    return (
        <FocalPointPicker
            {...pickerProps}
            ref={ref}
            value={toFocalPoint(input.value)}
            {...validationProps}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <FieldValue = FocalPoint>(props: FocalPointPickerFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
