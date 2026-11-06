import { Slider, type SliderProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface SliderFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<SliderProps, "name" | "value" | "onChange" | "onBlur" | "required" | "state" | "validationMessage"> {}

export function toSliderValue(value: unknown, min = 0) {
    return typeof value === "number" && !Number.isNaN(value) ? value : min;
}

/**
 * A `Slider` connected to a numeric React Hook Form field. Without a value, the thumb rests at `min`. Shows the field's error below the
 * slider once it was touched or the form was submitted.
 */
export const SliderField = forwardRef(function SliderField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, ...props }: SliderFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, sliderProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);

    return (
        <Slider
            {...sliderProps}
            ref={ref}
            name={field.name}
            value={toSliderValue(field.value, sliderProps.min)}
            {...validationProps}
            onChange={field.onChange}
            onBlur={field.onBlur}
        />
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: SliderFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
