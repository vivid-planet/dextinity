import { Field, Slider, type SliderProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { ReactHookFormFieldConfig } from "../../fieldAdapter/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface SliderFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        FieldAdapterFieldProps,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<SliderProps, "name" | "value" | "onChange" | "onBlur" | "onFocus" | "style" | "required" | "state" | "validationMessage"> {}

export function toSliderValue(value: unknown, min = 0) {
    return typeof value === "number" && !Number.isNaN(value) ? value : min;
}

/**
 * A `Slider` connected to a numeric React Hook Form field. Without a value, the thumb rests at `min`. Shows the field's error below the
 * slider once it was touched or the form was submitted.
 */
export const SliderField = forwardRef(function SliderField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
    { name, onFocus, ...props }: SliderFieldProps<TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const [fieldProps, sliderProps] = splitFieldProps(controlProps, groupFieldPropKeys);
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
            <Slider {...sliderProps} ref={ref} name={field.name} value={toSliderValue(field.value, sliderProps.min)} onChange={field.onChange} />
        </Field>
    );
}) as <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
    props: SliderFieldProps<TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
