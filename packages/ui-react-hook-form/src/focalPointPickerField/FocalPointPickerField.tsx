import { type FocalPoint, FocalPointPicker, type FocalPointPickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";
import { useValidationMessage } from "../field/useValidationMessage";

export interface FocalPointPickerFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<FocalPointPickerProps, "value" | "onChange" | "onBlur" | "defaultValue"> {}

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
>(
    { name, "aria-describedby": ariaDescribedBy, ...props }: FocalPointPickerFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, pickerProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);
    const { message, describedBy } = useValidationMessage(validationProps, ariaDescribedBy);

    return (
        <>
            <FocalPointPicker
                {...pickerProps}
                ref={ref}
                value={toFocalPoint(field.value)}
                aria-describedby={describedBy}
                onChange={field.onChange}
                onBlur={field.onBlur}
            />
            {message}
        </>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: FocalPointPickerFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
