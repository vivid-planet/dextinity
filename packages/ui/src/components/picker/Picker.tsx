import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type ReactNode, type RefAttributes, useCallback, useId, useRef } from "react";

import { ControlFrame, type PureControlProps, useControlState } from "../field/ControlFrame";
import type { FieldOwnerState } from "../field/Field";
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

export interface PickerProps<Value> extends PureControlProps {
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
        disabled: disabledProp,
        readOnly: readOnlyProp,
        value,
        renderValue,
        onOpen,
        onClear,
        placeholder,
        icon = <Icon name="more-horizontal" />,
        labels: labelsProp,
        id,
        className,
        style,
        ...ariaProps
    }: PickerProps<Value>,
    ref: ForwardedRef<HTMLButtonElement>,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const valueId = `${useId()}value`;
    const { disabled, readOnly } = useControlState(disabledProp, readOnlyProp);
    const empty = isEmpty(value);
    const showsClear = onClear != null && !empty && !disabled && !readOnly;
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const setTriggerRef = useCallback(
        (element: HTMLButtonElement | null) => {
            triggerRef.current = element;
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        },
        [ref],
    );

    return (
        <ControlFrame controlName="Picker" {...ariaProps} id={id} disabled={disabledProp} readOnly={readOnlyProp} className={className} style={style}>
            {(control, { nameId, requiredDescriptionId }) => (
                <>
                    <button
                        ref={setTriggerRef}
                        type="button"
                        id={control.id}
                        className={styles.trigger}
                        aria-haspopup="dialog"
                        aria-labelledby={clsx(nameId, valueId)}
                        data-readonly={readOnly ? "" : undefined}
                        aria-describedby={clsx(control["aria-describedby"], requiredDescriptionId) || undefined}
                        aria-invalid={control["aria-invalid"]}
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
                        <button
                            type="button"
                            className={styles.clear}
                            aria-label={labels.clear}
                            onClick={() => {
                                onClear();
                                // The clear button disappears with the value; the focus stays in the field rather than falling back to the page
                                triggerRef.current?.focus();
                            }}
                        >
                            <Icon name="close" />
                        </button>
                    )}
                    <span className={styles.openIcon} aria-hidden onClick={disabled || readOnly ? undefined : onOpen}>
                        {icon}
                    </span>
                </>
            )}
        </ControlFrame>
    );
}) as <Value>(props: PickerProps<Value> & RefAttributes<HTMLButtonElement>) => ReactNode;
