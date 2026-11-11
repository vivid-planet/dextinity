import { type FocalPoint, FocalPointPicker, type FocalPointPickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface FocalPointPickerFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<FocalPointPickerProps, "value" | "onChange" | "onBlur" | "defaultValue" | "state" | "validationMessage"> {}

const center: FocalPoint = { x: 0.5, y: 0.5 };

export function toFocalPoint(value: unknown): FocalPoint {
    if (value != null && typeof value === "object" && "x" in value && "y" in value) {
        return value as FocalPoint;
    }
    return center;
}

/**
 * A `FocalPointPicker` connected to a React Hook Form field holding the focal point. Without a value, the marker rests in the center.
 * Shows the field's error below the picker once it was touched or the form was submitted.
 */
export const FocalPointPickerField = forwardRef(function FocalPointPickerField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({ name, ...props }: FocalPointPickerFieldProps<TFieldValues, TName>, forwardedRef: ForwardedRef<HTMLDivElement>) {
    const [options, pickerProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <FocalPointPicker
            {...pickerProps}
            ref={ref}
            value={toFocalPoint(field.value)}
            {...validationProps}
            onChange={field.onChange}
            onBlur={field.onBlur}
        />
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: FocalPointPickerFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
