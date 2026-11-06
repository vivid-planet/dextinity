import { Slider, type SliderProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";
import { useValidationMessage } from "../field/useValidationMessage";

export interface SliderFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<SliderProps, "name" | "value" | "onChange" | "onBlur" | "required"> {}

export function toSliderValue(value: unknown, min = 0) {
    return typeof value === "number" && !Number.isNaN(value) ? value : min;
}

/**
 * A `Slider` connected to a numeric React Hook Form field. Without a value, the thumb rests at `min`. Shows the field's error below the
 * slider once it was touched or the form was submitted.
 */
export const SliderField = forwardRef(function SliderField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, "aria-describedby": ariaDescribedBy, ...props }: SliderFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, sliderProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);
    const { message, describedBy } = useValidationMessage(validationProps, ariaDescribedBy);

    return (
        <>
            <Slider
                {...sliderProps}
                ref={ref}
                name={field.name}
                value={toSliderValue(field.value, sliderProps.min)}
                aria-describedby={describedBy}
                onChange={field.onChange}
                onBlur={field.onBlur}
            />
            {message}
        </>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: SliderFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
