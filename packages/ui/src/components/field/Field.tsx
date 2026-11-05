import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode, useCallback, useId, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Spinner } from "../spinner/Spinner";
import styles from "./Field.module.scss";
import { FieldContext, type FieldContextValue } from "./fieldContext";

export type FieldState = "default" | "success" | "warning" | "error";
export type FieldSize = "small" | "default" | "large";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FieldOwnerState = {
    state: FieldState;
    size: FieldSize;
    required: boolean;
    disabled: boolean;
    readOnly: boolean;
    loading: boolean;
};

/**
 * Props a control inside a `Field` spreads to connect to its label, message, and state.
 */
export interface FieldControlProps {
    id: string;
    "aria-labelledby": string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
    "aria-required": true | undefined;
    "aria-busy": true | undefined;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

interface FieldSlotProps {
    /** Props for the `label` slot. */
    label?: SlotPropsValue<FieldOwnerState, "label">;
    /** Props for the `box` slot, the bordered area around the control. */
    box?: SlotPropsValue<FieldOwnerState, "div">;
    /** Props for the `prefix` slot. */
    prefix?: SlotPropsValue<FieldOwnerState, "span">;
    /** Props for the `suffix` slot. */
    suffix?: SlotPropsValue<FieldOwnerState, "span">;
    /** Props for the `message` slot. */
    message?: SlotPropsValue<FieldOwnerState, "div">;
}

/**
 * Props shared by every field: label, help, validation, state, and size.
 */
export interface FieldBaseProps {
    /** Visible label above the field. Never replace it with a placeholder. */
    label: ReactNode;
    /**
     * Adds a star after the label and marks the control as required.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /** Permanent help below the field. */
    helperText?: ReactNode;
    /** Message for the `state`. Replaces the help while the state is `success`, `warning`, or `error`. Say what is missing and how to fix it. */
    validationMessage?: ReactNode;
    /**
     * Validation state, shown by the field's line and message color.
     *
     * @defaultValue `"default"`
     */
    state?: FieldState;
    /**
     * Prevents interaction with the field.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the value without allowing changes. It stays focusable and selectable.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /**
     * Shows a spinner in place of the suffix, e.g. while a suggestion loads.
     *
     * @defaultValue `false`
     */
    loading?: boolean;
    /**
     * Height and font size, following the density.
     *
     * @defaultValue `"default"`
     */
    size?: FieldSize;
    /** Icon or text before the control, e.g. a domain. */
    prefix?: ReactNode;
    /** Icon or unit after the control. Replaced by a spinner while `loading`. */
    suffix?: ReactNode;
    /** Actions at the label, usually `FieldActions` for translate and AI. */
    actions?: ReactNode;
}

export interface FieldProps extends FieldBaseProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix"> {
    /**
     * The id of the control, used to connect it with the label.
     *
     * @defaultValue generated
     */
    controlId?: string;
    /** Shown at the end of the label row, e.g. a character count. */
    counter?: ReactNode;
    /** The control. A function receives the props that connect it to the label, message, and state. */
    children: ReactNode | ((control: FieldControlProps) => ReactNode);
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldSlotProps;
}

const interactiveSelector = "input, textarea, select, button, a, [contenteditable='true'], [role='button']";

/**
 * The frame shared by all form fields: label, required star, actions, the bordered box with prefix and suffix, help, and validation
 * message. Wrap a custom control in it to get the same look and accessible connections.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
    {
        label,
        required = false,
        helperText,
        validationMessage,
        state = "default",
        disabled = false,
        readOnly = false,
        loading = false,
        size = "default",
        prefix,
        suffix,
        actions,
        counter,
        controlId: controlIdProp,
        children,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const generatedId = useId();
    const controlId = controlIdProp ?? `${generatedId}control`;
    const labelId = `${generatedId}label`;
    const messageId = `${generatedId}message`;

    const [actionPending, setActionPending] = useState(false);
    const [actionContent, setActionContent] = useState<ReactNode>(null);

    const ownerState: FieldOwnerState = { state, size, required, disabled, readOnly, loading: loading || actionPending };

    const showsValidation = state !== "default" && validationMessage != null && validationMessage !== "";
    const message = showsValidation ? validationMessage : helperText;
    const hasMessage = message != null && message !== "";

    const control: FieldControlProps = {
        id: controlId,
        "aria-labelledby": labelId,
        "aria-describedby": hasMessage ? messageId : undefined,
        "aria-invalid": state === "error" ? true : undefined,
        "aria-required": required ? true : undefined,
        "aria-busy": ownerState.loading ? true : undefined,
        disabled,
        readOnly,
        required,
    };

    const contextValue: FieldContextValue = { control, ownerState, setActionPending, setActionContent };

    const focusControl = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (disabled || (event.target instanceof Element && event.target.closest(interactiveSelector))) {
                return;
            }
            const element = event.currentTarget.ownerDocument.getElementById(controlId);
            if (element) {
                event.preventDefault();
                element.focus();
            }
        },
        [controlId, disabled],
    );

    const labelProps = resolveSlotProps<FieldOwnerState, "label", "label">({
        ownProps: { className: styles.label, id: labelId, htmlFor: controlId },
        slotProps: slotProps?.label,
        ownerState,
    });
    const boxProps = resolveSlotProps<FieldOwnerState, "div", "div">({
        ownProps: { className: styles.box, onMouseDown: focusControl },
        slotProps: slotProps?.box,
        ownerState,
    });
    const prefixProps = resolveSlotProps<FieldOwnerState, "span", "span">({
        ownProps: { className: styles.prefix },
        slotProps: slotProps?.prefix,
        ownerState,
    });
    const suffixProps = resolveSlotProps<FieldOwnerState, "span", "span">({
        ownProps: { className: styles.suffix },
        slotProps: slotProps?.suffix,
        ownerState,
    });
    const messageProps = resolveSlotProps<FieldOwnerState, "div", "div">({
        ownProps: { className: styles.message, id: messageId },
        slotProps: slotProps?.message,
        ownerState,
    });

    return (
        <FieldContext.Provider value={contextValue}>
            <div
                {...restProps}
                ref={ref}
                className={clsx(styles.root, className)}
                data-state={ownerState.state}
                data-size={ownerState.size}
                data-required={ownerState.required ? "" : undefined}
                data-disabled={ownerState.disabled ? "" : undefined}
                data-readonly={ownerState.readOnly ? "" : undefined}
                data-loading={ownerState.loading ? "" : undefined}
            >
                <div className={styles.labelRow}>
                    <label {...labelProps}>{label}</label>
                    {required && <span className={styles.required} aria-hidden />}
                    {counter != null && <span className={styles.counter}>{counter}</span>}
                    {actions != null && <span className={styles.actions}>{actions}</span>}
                </div>
                <div {...boxProps}>
                    {prefix != null && <span {...prefixProps}>{prefix}</span>}
                    {typeof children === "function" ? children(control) : children}
                    {ownerState.loading ? (
                        <span {...suffixProps}>
                            <Spinner className={styles.spinner} />
                        </span>
                    ) : (
                        suffix != null && <span {...suffixProps}>{suffix}</span>
                    )}
                </div>
                {actionContent}
                {hasMessage && <div {...messageProps}>{message}</div>}
            </div>
        </FieldContext.Provider>
    );
});
