import { Field, Picker, type PickerProps } from "@dextinity/ui";
import { type ForwardedRef, forwardRef, memo, type ReactNode, type RefAttributes, useState } from "react";

import type { FieldAdapterActions, FieldAdapterActionsContext, FieldAdapterBaseProps } from "../../fieldAdapter/fieldAdapterProps";
import { boxFieldPropKeys, type FieldAdapterBoxFieldProps, splitFieldProps } from "../../fieldAdapter/fieldFrameProps";
import type { FinalFormFieldConfig } from "../../fieldAdapter/finalFormFieldConfig";
import { renderActions } from "../../fieldAdapter/renderActions";
import { splitFieldAdapterProps } from "../../fieldAdapter/splitFieldAdapterProps";
import { useFieldAdapter } from "../../fieldAdapter/useFieldAdapter";

/**
 * What a `PickerField`'s `renderPicker` receives to show the application's picker and set the field's value from it.
 */
export interface PickerFieldPickerContext<Value> {
    /** Whether the picker is open. */
    open: boolean;
    /** The field's current value. */
    value: Value | null;
    /** Sets the field's value and closes the picker. */
    onChange: (value: Value | null) => void;
    /** Closes the picker without changing the value. */
    onClose: () => void;
}

export interface PickerFieldProps<Value, FieldValue = Value | null>
    extends
        FieldAdapterBaseProps,
        FieldAdapterBoxFieldProps,
        FinalFormFieldConfig<FieldValue, Value | null>,
        Omit<PickerProps<Value>, "value" | "onOpen" | "onClear" | "onBlur" | "onFocus" | "state" | "validationMessage" | "required" | "actions"> {
    /** Renders the application's picker, e.g. a dialog with the page tree, from whose choice the field's value is set. */
    renderPicker?: (context: PickerFieldPickerContext<Value>) => ReactNode;
    /** Called when the user activates the field, with the field's value and setter, e.g. to open a picker outside the form. */
    onOpen?: (context: FieldAdapterActionsContext<Value | null>) => void;
    /**
     * Shows a button that clears the value while one is chosen.
     *
     * @defaultValue `true`, unless `required`
     */
    clearable?: boolean;
    /** Content at the label, or a function of the field's value and setter, e.g. to connect `FieldActions`. */
    actions?: FieldAdapterActions<Value | null>;
}

export function toPickerValue<Value>(value: unknown): Value | null {
    return value == null || value === "" ? null : (value as Value);
}

/**
 * A `Picker` connected to a React Final Form field: the value chosen in the application's picker, or `null` for nothing chosen. Shows the
 * field's error once the picker was closed or the form was submitted.
 */
export const PickerField = memo(
    forwardRef(function PickerField<Value, FieldValue = Value | null>(
        { name, actions, renderPicker, onOpen, clearable, onFocus, ...props }: PickerFieldProps<Value, FieldValue>,
        forwardedRef: ForwardedRef<HTMLButtonElement>,
    ) {
        const [options, controlProps] = splitFieldAdapterProps(props);
        const [fieldProps, pickerProps] = splitFieldProps(controlProps, boxFieldPropKeys);
        const {
            input,
            validationProps,
            ref,
            onBlur,
            onFocus: onFieldFocus,
        } = useFieldAdapter<FieldValue, Value | null, HTMLButtonElement>(name, options, forwardedRef);
        const [open, setOpen] = useState(false);
        const value = toPickerValue<Value>(input.value);
        const setValue = (next: Value | null) => input.onChange(next);
        const close = () => {
            setOpen(false);
            onBlur();
        };
        const showsClear = clearable ?? !options.required;

        return (
            <>
                <Field
                    {...fieldProps}
                    {...validationProps}
                    required={options.required}
                    actions={renderActions(actions, value, setValue)}
                    // While the picker is open, the focus is in the picker; the field counts as touched once it closes
                    onBlur={open ? undefined : onBlur}
                    onFocus={(event) => {
                        onFieldFocus();
                        onFocus?.(event);
                    }}
                >
                    <Picker<Value>
                        {...pickerProps}
                        ref={ref}
                        value={value}
                        onOpen={() => {
                            if (renderPicker != null) {
                                setOpen(true);
                            }
                            onOpen?.({ value, setValue });
                        }}
                        onClear={showsClear ? () => setValue((Array.isArray(value) ? [] : null) as Value | null) : undefined}
                    />
                </Field>
                {renderPicker?.({
                    open,
                    value,
                    onChange: (next) => {
                        setValue(next);
                        close();
                    },
                    onClose: close,
                })}
            </>
        );
    }),
) as <Value, FieldValue = Value | null>(props: PickerFieldProps<Value, FieldValue> & RefAttributes<HTMLButtonElement>) => ReactNode;
