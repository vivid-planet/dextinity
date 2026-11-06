import { SegmentedControl, type SegmentedControlProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { ReactHookFormFieldConfig } from "../field/reactHookFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";
import { useValidationMessage } from "../field/useValidationMessage";

export interface SegmentedControlFieldProps<
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>
    extends
        FieldAdapterBaseProps<TFieldValues, TName>,
        ReactHookFormFieldConfig<TFieldValues, TName>,
        Omit<SegmentedControlProps<Value>, "value" | "onChange" | "onBlur"> {}

/**
 * A `SegmentedControl` connected to a React Hook Form field holding one of the options' values. Without a value, no option is pressed.
 * Shows the field's error below the control once it was touched or the form was submitted.
 */
export const SegmentedControlField = forwardRef(function SegmentedControlField<
    Value extends string,
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>(
    { name, "aria-describedby": ariaDescribedBy, ...props }: SegmentedControlFieldProps<Value, TFieldValues, TName>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, controlProps] = splitFieldAdapterProps(props);
    const { field, validationProps, ref } = useFieldAdapter<TFieldValues, TName, HTMLDivElement>({ name, ...options }, forwardedRef);
    const { message, describedBy } = useValidationMessage(validationProps, ariaDescribedBy);

    return (
        <>
            <SegmentedControl<Value>
                {...controlProps}
                ref={ref}
                value={field.value ?? ("" as Value)}
                aria-describedby={describedBy}
                onChange={field.onChange}
                onBlur={field.onBlur}
            />
            {message}
        </>
    );
}) as <
    Value extends string = string,
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    props: SegmentedControlFieldProps<Value, TFieldValues, TName> & RefAttributes<HTMLDivElement>,
) => ReactNode;
