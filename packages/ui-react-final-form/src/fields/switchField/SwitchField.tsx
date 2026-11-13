import { Field, Switch, type SwitchProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { type FieldAdapterFieldProps, groupFieldPropKeys, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

export interface SwitchFieldProps<FieldValue = boolean>
    extends
        FieldAdapterBaseProps,
        FieldAdapterFieldProps,
        FinalFormFieldConfig<FieldValue, boolean>,
        Omit<
            SwitchProps,
            "name" | "checked" | "onChange" | "onBlur" | "onFocus" | "required" | "defaultValue" | "defaultChecked" | "state" | "validationMessage"
        > {}

/**
 * A `Switch` connected to a boolean React Final Form field. Shows the field's error below the switch once it was touched or the form was
 * submitted.
 */
export const SwitchField = memo(
    forwardRef(function SwitchField<FieldValue = boolean>(
        { name, onFocus, ...props }: SwitchFieldProps<FieldValue>,
        forwardedRef: ForwardedRef<HTMLDivElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, switchProps] = splitFieldProps(controlProps, groupFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, boolean, HTMLDivElement>(name, options, forwardedRef);

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
                <Switch {...switchProps} ref={ref} name={input.name} checked={input.value === true} onChange={input.onChange} />
            </Field>
        );
    }),
) as <FieldValue = boolean>(props: SwitchFieldProps<FieldValue> & RefAttributes<HTMLDivElement>) => ReactNode;
