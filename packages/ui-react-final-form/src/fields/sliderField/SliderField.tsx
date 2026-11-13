import { Field, Slider, type SliderProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface SliderFieldProps<FieldValue = number>
    extends
        FieldAdapterBaseProps,
        FieldAdapterFieldProps,
        Omit<FinalFormFieldConfig<FieldValue, number>, "format">,
        Omit<SliderProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "style" | "required" | "state" | "validationMessage"> {}

export function toSliderValue(value: unknown, min = 0) {
    return typeof value === "number" && !Number.isNaN(value) ? value : min;
}

/**
 * A `Slider` connected to a numeric React Final Form field. Without a value, the thumb rests at `min`. Shows the field's error below the
 * slider once it was touched or the form was submitted.
 */
export const SliderField = memo(
    forwardRef(function SliderField<FieldValue = number>(
        { name, format, onFocus, ...props }: SliderFieldProps<FieldValue>,
        forwardedRef: ForwardedRef<HTMLDivElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, sliderProps] = splitFieldProps(controlProps, groupFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, number, HTMLDivElement>(name, options, forwardedRef);

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
                <Slider
                    {...sliderProps}
                    ref={ref}
                    name={input.name}
                    format={format}
                    value={toSliderValue(input.value, sliderProps.min)}
                    onChange={input.onChange}
                />
            </Field>
        );
    }),
) as <FieldValue = number>(props: SliderFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
