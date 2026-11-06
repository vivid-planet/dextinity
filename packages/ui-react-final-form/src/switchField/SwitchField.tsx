import { Switch, type SwitchProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";

export interface SwitchFieldProps<FieldValue = boolean>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, boolean>,
        Omit<
            SwitchProps,
            "name" | "checked" | "onChange" | "onBlur" | "required" | "defaultValue" | "defaultChecked" | "state" | "validationMessage"
        > {}

/**
 * A `Switch` connected to a boolean React Final Form field. Shows the field's error below the switch once it was touched or the form was
 * submitted.
 */
export const SwitchField = forwardRef(function SwitchField<FieldValue = boolean>(
    { name, onFocus, ...props }: SwitchFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) {
    const [options, switchProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, boolean, HTMLDivElement>(name, options, forwardedRef);

    return (
        <Switch
            {...switchProps}
            ref={ref}
            name={input.name}
            checked={input.value === true}
            required={options.required}
            {...validationProps}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <FieldValue = boolean>(props: SwitchFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
