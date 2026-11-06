import { Switch, type SwitchProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";
import { useValidationMessage } from "../field/useValidationMessage";

export interface SwitchFieldProps<FieldValue = boolean>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, boolean>,
        Omit<SwitchProps, "name" | "checked" | "onChange" | "onBlur" | "defaultValue" | "defaultChecked"> {}

/**
 * A `Switch` connected to a boolean React Final Form field. Shows the field's error below the switch once it was touched or the form was
 * submitted.
 */
export const SwitchField = forwardRef(function SwitchField<FieldValue = boolean>(
    { name, onFocus, "aria-describedby": ariaDescribedBy, ...props }: SwitchFieldProps<FieldValue>,
    forwardedRef: ForwardedRef<HTMLLabelElement>,
) {
    const [options, switchProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, boolean, HTMLLabelElement>(name, options, forwardedRef);
    const { message, describedBy } = useValidationMessage(validationProps, ariaDescribedBy);

    return (
        <>
            <Switch
                {...switchProps}
                ref={ref}
                name={input.name}
                checked={input.value === true}
                aria-describedby={describedBy}
                onChange={input.onChange}
                onBlur={onBlur}
                onFocus={(event) => {
                    onFieldFocus();
                    onFocus?.(event);
                }}
            />
            {message}
        </>
    );
}) as <FieldValue = boolean>(props: SwitchFieldProps<FieldValue> & RefAttributes<HTMLLabelElement>) => ReactNode;
