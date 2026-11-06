import { Slider, type SliderProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface SliderFieldProps<FieldValue = number>
    extends
        FieldAdapterBaseProps,
        Omit<FinalFormFieldConfig<FieldValue, number>, "format">,
        Omit<SliderProps, "name" | "value" | "onChange" | "onBlur" | "required" | "state" | "validationMessage"> {}

export function toSliderValue(value: unknown, min = 0) {
    return typeof value === "number" && !Number.isNaN(value) ? value : min;
}

/**
 * A `Slider` connected to a numeric React Final Form field. Without a value, the thumb rests at `min`. Shows the field's error below the
 * slider once it was touched or the form was submitted.
 */
export const SliderField = forwardRef(function SliderField<FieldValue = number>(
    { name, format, onFocus, ...props }: SliderFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, sliderProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, number, HTMLDivElement>(name, options, forwardedRef);

    return (
        <Slider
            {...sliderProps}
            ref={ref}
            name={input.name}
            format={format}
            value={toSliderValue(input.value, sliderProps.min)}
            {...validationProps}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <FieldValue = number>(props: SliderFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
