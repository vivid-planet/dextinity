import { Combobox, type ComboboxProps, type ComboboxValue } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes } from "react";

import type { FieldAdapterActions, FieldAdapterBaseProps } from "../field/fieldAdapterProps";
import type { FinalFormFieldConfig } from "../field/finalFormFieldConfig";
import { renderActions } from "../field/renderActions";
import { splitFieldAdapterProps } from "../field/splitFieldAdapterProps";
import { useFieldAdapter } from "../field/useFieldAdapter";
import { toSelectValue } from "../selectField/SelectField";

export interface ComboboxFieldProps<Option, Multiple extends boolean = false, FieldValue = ComboboxValue<Multiple, Option>>
    extends
        FieldAdapterBaseProps,
        FinalFormFieldConfig<FieldValue, ComboboxValue<Multiple, Option>>,
        Omit<ComboboxProps<Option, Multiple>, "name" | "value" | "onChange" | "onBlur" | "state" | "validationMessage" | "required" | "actions"> {
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<ComboboxValue<Multiple, Option>>;
}

/**
 * A `Combobox` connected to a React Final Form field: the chosen option or `null` for nothing chosen, a list of options with `multiple`.
 * Shows the field's error once it was touched or the form was submitted.
 */
export const ComboboxField = forwardRef(function ComboboxField<
    Option,
    Multiple extends boolean = false,
    FieldValue = ComboboxValue<Multiple, Option>,
>({ name, actions, onFocus, ...props }: ComboboxFieldProps<Option, Multiple, FieldValue>, forwardedRef: ForwardedRef<HTMLInputElement>) {
    const [options, comboboxProps] = splitFieldAdapterProps(props);
    const {
        input,
        validationProps,
        ref,
        onBlur,
        onFocus: onFieldFocus,
    } = useFieldAdapter<FieldValue, ComboboxValue<Multiple, Option>, HTMLInputElement>(name, options, forwardedRef);
    const value = toSelectValue<Multiple, Option>(input.value, comboboxProps.multiple === true);

    return (
        <Combobox<Option, Multiple>
            {...comboboxProps}
            {...validationProps}
            ref={ref}
            name={input.name}
            value={value}
            required={options.required}
            actions={renderActions(actions, value, input.onChange)}
            onChange={input.onChange}
            onBlur={onBlur}
            onFocus={(event) => {
                onFieldFocus();
                onFocus?.(event);
            }}
        />
    );
}) as <Option, Multiple extends boolean = false, FieldValue = ComboboxValue<Multiple, Option>>(
    props: ComboboxFieldProps<Option, Multiple, FieldValue> & RefAttributes<HTMLInputElement>,
) => ReactNode;
