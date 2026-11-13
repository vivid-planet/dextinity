import { Combobox, type ComboboxProps, type ComboboxValue, Field } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, leavesField, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { defaultOptionKey, isEqualByKey } from "../../fieldAdapter/isEqualByKey";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";
import { toSelectValue } from "../selectField/SelectField";

export interface ComboboxFieldProps<Option, Multiple extends boolean = false, FieldValue = ComboboxValue<Multiple, Option>>
    extends
        FieldAdapterBaseProps,
        FieldAdapterBoxFieldProps,
        FinalFormFieldConfig<FieldValue, ComboboxValue<Multiple, Option>>,
        Omit<
            ComboboxProps<Option, Multiple>,
            "name" | "value" | "onChange" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"
        > {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<ComboboxValue<Multiple, Option>>;
}

/**
 * A `Combobox` connected to a React Final Form field: the chosen option or `null` for nothing chosen, a list of options with `multiple`.
 * Shows the field's error once it was touched or the form was submitted. Without `isEqual`, `parse`, and `format`, the field compares
 * options by `getOptionKey`, so choosing the same options again, e.g. freshly loaded ones, doesn't make it dirty.
 */
export const ComboboxField = memo(
    forwardRef(function ComboboxField<Option, Multiple extends boolean = false, FieldValue = ComboboxValue<Multiple, Option>>(
        { name, actions, onFocus, ...props }: ComboboxFieldProps<Option, Multiple, FieldValue>,
        forwardedRef: ForwardedRef<HTMLInputElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, comboboxProps] = splitFieldProps(controlProps, boxFieldPropKeys);
        const isEqual =
            options.isEqual ??
            (options.parse == null && options.format == null ? isEqualByKey(comboboxProps.getOptionKey ?? defaultOptionKey) : undefined);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, ComboboxValue<Multiple, Option>, HTMLInputElement>(name, { ...options, isEqual }, forwardedRef);
        const value = toSelectValue<Multiple, Option>(input.value, comboboxProps.multiple === true);

        return (
            <Field
                {...fieldProps}
                {...validationProps}
                required={options.required}
                actions={renderActions(actions, value, input.onChange)}
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
                <Combobox<Option, Multiple> {...comboboxProps} ref={ref} name={input.name} value={value} onChange={input.onChange} />
            </Field>
        );
    }),
) as <Option, Multiple extends boolean = false, FieldValue = ComboboxValue<Multiple, Option>>(
    props: ComboboxFieldProps<Option, Multiple, FieldValue> & RefAttributes<HTMLInputElement>,
) => ReactNode;
