import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes, useId } from "react";

import { Field, type FieldBaseProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import { Icon } from "../icon/Icon";
import styles from "./Picker.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type PickerOwnerState = FieldOwnerState & {
    empty: boolean;
};

/**
 * Texts of the picker, for translation.
 */
export interface PickerLabels {
    /** Accessible name of the button that clears the value. */
    clear: string;
}

const defaultLabels: PickerLabels = {
    clear: "Clear",
};

export interface PickerProps<Value>
    extends FieldBaseProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix" | "onChange" | "defaultValue"> {
    /** The chosen value, or `null` (or an empty list) when nothing is chosen. Always controlled. */
    value: Value | null;
    /** Shows the chosen value in the field, e.g. a page's name and path or a file's thumbnail and name. */
    renderValue: (value: Value) => ReactNode;
    /** Called when the user activates the field; open the picker, e.g. a dialog, and set `value` from what is chosen there. */
    onOpen: () => void;
    /** Shows a button that clears the value while one is chosen; set `value` to nothing in it. */
    onClear?: () => void;
    /** Shown while nothing is chosen. */
    placeholder?: ReactNode;
    /**
     * Shown at the end of the field, hinting at what the picker opens.
     *
     * @defaultValue a "more" icon
     */
    icon?: ReactNode;
    /** Texts of the clear button, for translation. */
    labels?: Partial<PickerLabels>;
    /** The id of the button that opens the picker, used to connect it with the label. */
    id?: string;
    /** Added alongside the component's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

function isEmpty(value: unknown) {
    return value == null || (Array.isArray(value) && value.length === 0);
}

/**
 * Shows the chosen value of something picked in a dialog or panel the application provides, e.g. a page from the page tree or a file
 * from the assets, and opens that picker.
 */
export const Picker = forwardRef(function Picker<Value>(
    {
        label,
        required,
        helperText,
        validationMessage,
        state,
        disabled = false,
        readOnly = false,
        loading,
        size,
        prefix,
        suffix,
        actions,
        value,
        renderValue,
        onOpen,
        onClear,
        placeholder,
        icon = <Icon name="more" />,
        labels: labelsProp,
        id,
        className,
        slotProps,
        ...restProps
    }: PickerProps<Value>,
    ref: ForwardedRef<HTMLButtonElement>,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const valueId = `${useId()}value`;
    const empty = isEmpty(value);
    const showsClear = onClear != null && !empty && !disabled && !readOnly;

    return (
        <Field
            {...restProps}
            className={clsx(styles.root, className)}
            data-empty={empty ? "" : undefined}
            controlId={id}
            label={label}
            required={required}
            helperText={helperText}
            validationMessage={validationMessage}
            state={state}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading}
            size={size}
            prefix={prefix}
            suffix={suffix}
            actions={actions}
            slotProps={slotProps}
        >
            {(control) => (
                <>
                    <button
                        ref={ref}
                        type="button"
                        id={control.id}
                        className={styles.trigger}
                        aria-haspopup="dialog"
                        aria-labelledby={`${control["aria-labelledby"]} ${valueId}`}
                        aria-describedby={control["aria-describedby"]}
                        aria-invalid={control["aria-invalid"]}
                        aria-required={control["aria-required"]}
                        aria-busy={control["aria-busy"]}
                        disabled={disabled}
                        onClick={readOnly ? undefined : onOpen}
                    >
                        {empty ? (
                            <span id={valueId} className={styles.placeholder}>
                                {placeholder}
                            </span>
                        ) : (
                            <span id={valueId} className={styles.value}>
                                {renderValue(value as Value)}
                            </span>
                        )}
                    </button>
                    {showsClear && (
                        <button type="button" className={styles.clear} aria-label={labels.clear} onClick={onClear}>
                            <Icon name="close" />
                        </button>
                    )}
                    <span className={styles.openIcon} aria-hidden onClick={disabled || readOnly ? undefined : onOpen}>
                        {icon}
                    </span>
                </>
            )}
        </Field>
    );
}) as <Value>(props: PickerProps<Value> & RefAttributes<HTMLButtonElement>) => ReactNode;
