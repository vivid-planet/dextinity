import { clsx } from "clsx";
import { type ElementType, forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode, useCallback, useId, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { defaultHelpTextButtonLabel, HelpTextButton } from "../formLabel/HelpTextButton";
import { Icon } from "../icon/Icon";
import { Spinner } from "../spinner/Spinner";
import styles from "./Field.module.scss";
import { type ControlReport, FieldContext, type FieldContextValue } from "./fieldContext";

export type FieldState = "default" | "success" | "warning" | "error";
export type FieldSize = "small" | "default" | "large";
export type FieldLayout = "inline" | "stacked" | "group";

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
    layout: FieldLayout;
};

/**
 * Props a control inside a `Field` spreads to connect to its label, message, and state.
 */
export interface FieldControlProps {
    id: string;
    /** The id of the field's label, or `undefined` for a field without a label. */
    "aria-labelledby": string | undefined;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
    "aria-required": true | undefined;
    "aria-busy": true | undefined;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/**
 * Texts of the field, for translation.
 */
export interface FieldLabels {
    /** Accessible name of the info button that shows the `helpText`. */
    helpText: string;
    /**
     * Read as the description of a required control whose role can't be marked as required, e.g. a `CheckboxGroup` or the button of a
     * `Picker`. Other controls are marked with `aria-required`.
     */
    required: string;
}

interface FieldSlots {
    /**
     * Element for the `helpIcon` slot, the icon of the button that shows the `helpText`.
     *
     * @defaultValue `Icon` named `info`
     */
    helpIcon?: ElementType;
}

interface FieldSlotProps {
    /** Props for the `label` slot. */
    label?: SlotPropsValue<FieldOwnerState, "label">;
    /** Props for the `helpButton` slot, the info button after the label that shows the `helpText`. */
    helpButton?: SlotPropsValue<FieldOwnerState, "button">;
    /** Props for the `helpIcon` slot, e.g. another icon `name`. */
    helpIcon?: SlotPropsValue<FieldOwnerState, typeof Icon>;
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
    /**
     * Visible label above the field. Never replace it with a placeholder. Leave it out only when the control names itself, e.g. a
     * `Checkbox` with its text, and the field adds just its message.
     */
    label?: ReactNode;
    /**
     * Adds a star after the label and marks the control as required.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /**
     * Extra explanation behind an info button after the label, shown in a tooltip on hover, keyboard focus, and tap, and read as the
     * control's description. Use it for background most users don't need; what everyone needs belongs in `helperText`.
     */
    helpText?: ReactNode;
    /** Permanent help below the field, always visible. */
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
    /** Actions at the label, usually `FieldActions` for translate. */
    actions?: ReactNode;
}

export interface FieldProps extends FieldBaseProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix"> {
    /**
     * How the field holds its control: `inline` draws a box with prefix, control, and suffix in a row of the field's height; `stacked`
     * lets a multi-line control fill the box from edge to edge, e.g. `RichTextEditor` with its toolbar above the text; `group` draws no
     * box, for a control that groups several inputs or draws its own frame, e.g. `RadioGroup`, `CheckboxGroup`, `Slider`, or `Checkbox`.
     * In a group, the label names the control's group element instead of pointing to one input.
     *
     * @defaultValue `"inline"`
     */
    layout?: FieldLayout;
    /**
     * The id of the control, used to connect it with the label.
     *
     * @defaultValue generated
     */
    controlId?: string;
    /** Shown at the end of the label row, e.g. a character count. */
    counter?: ReactNode;
    /** Texts of the field, for translation. */
    labels?: Partial<FieldLabels>;
    /**
     * The control, e.g. `Input`, `Select`, or `DatePicker`, which takes the field's id, label, message, and state. A function receives
     * the props that connect a custom control to the label, message, and state.
     */
    children: ReactNode | ((control: FieldControlProps) => ReactNode);
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: FieldSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldSlotProps;
}

const interactiveSelector = "input, textarea, select, button, a, [contenteditable='true'], [role='button']";

function hasContent(node: ReactNode) {
    return node != null && node !== "" && node !== false;
}

/**
 * The frame of a form field: label, required star, help text, actions, the bordered box with prefix and suffix, help, and validation
 * message. Put any control in it, e.g. `<Field label="Title"><Input /></Field>`: the control takes the field's id, label, message,
 * and state. Wrap a custom control in it to get the same look and accessible connections, e.g. a third-party editor with
 * `layout="stacked"`.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
    {
        label,
        required = false,
        helpText,
        helperText,
        validationMessage,
        state: stateProp = "default",
        disabled = false,
        readOnly = false,
        loading = false,
        size = "default",
        prefix,
        suffix,
        actions,
        counter: counterProp,
        layout = "inline",
        controlId: controlIdProp,
        labels: labelsProp,
        children,
        className,
        slots,
        slotProps,
        ...restProps
    },
    ref,
) {
    const generatedId = useId();
    const controlId = controlIdProp ?? `${generatedId}control`;
    const labelId = `${generatedId}label`;
    const helpTextId = `${generatedId}help`;
    const messageId = `${generatedId}message`;
    const requiredId = `${generatedId}required`;
    const labels: FieldLabels = { helpText: defaultHelpTextButtonLabel, required: "Required", ...labelsProp };

    const [actionPending, setActionPending] = useState(false);
    const [actionContent, setActionContent] = useState<ReactNode>(null);
    const [controlReport, setControlReport] = useState<ControlReport>({});

    const controlError = hasContent(controlReport.error) ? controlReport.error : undefined;
    const state = controlError != null ? "error" : stateProp;
    const counter = counterProp ?? controlReport.counter;

    const ownerState: FieldOwnerState = {
        state,
        size,
        required,
        disabled,
        readOnly,
        loading: loading || actionPending || controlReport.pending === true,
        layout,
    };

    const shownValidationMessage = controlError ?? validationMessage;
    const showsValidation = state !== "default" && hasContent(shownValidationMessage);
    const message = showsValidation ? shownValidationMessage : helperText;
    const hasMessage = hasContent(message);
    const hasLabel = hasContent(label);
    const hasHelpText = hasContent(helpText);

    const control: FieldControlProps = {
        id: controlId,
        "aria-labelledby": hasLabel ? labelId : undefined,
        "aria-describedby": clsx(hasHelpText && helpTextId, hasMessage && messageId) || undefined,
        "aria-invalid": state === "error" ? true : undefined,
        "aria-required": required ? true : undefined,
        "aria-busy": ownerState.loading ? true : undefined,
        disabled,
        readOnly,
        required,
    };

    const contextValue: FieldContextValue = {
        control,
        ownerState,
        setActionPending,
        setActionContent,
        setControlReport,
        requiredDescriptionId: required ? requiredId : undefined,
    };

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

    const { htmlFor, form, ...labelProps } = resolveSlotProps<FieldOwnerState, "label", "label">({
        ownProps: { className: styles.label, id: labelId, htmlFor: controlId },
        slotProps: slotProps?.label,
        ownerState,
    });
    const helpButtonProps = resolveSlotProps<FieldOwnerState, "button", "button">({
        ownProps: { className: styles.helpButton, "aria-label": labels.helpText },
        slotProps: slotProps?.helpButton,
        ownerState,
    });
    const helpIconProps = resolveSlotProps<FieldOwnerState, typeof Icon, typeof Icon>({
        ownProps: { name: "info" },
        slotProps: slotProps?.helpIcon,
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

    const labelContent = (
        <>
            {label}
            {required && <span className={styles.required} aria-hidden />}
        </>
    );
    const controlContent = typeof children === "function" ? children(control) : children;
    const hasLabelRow = hasLabel || hasHelpText || counter != null || actions != null;

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
                data-layout={ownerState.layout}
            >
                {hasLabelRow && (
                    <div className={styles.labelRow}>
                        {hasLabel &&
                            (layout === "group" ? (
                                <span {...labelProps}>{labelContent}</span>
                            ) : (
                                <label {...labelProps} htmlFor={htmlFor} form={form}>
                                    {labelContent}
                                </label>
                            ))}
                        {hasHelpText && (
                            <HelpTextButton
                                helpText={helpText}
                                helpTextId={helpTextId}
                                buttonProps={helpButtonProps}
                                IconSlot={slots?.helpIcon ?? Icon}
                                iconProps={helpIconProps}
                            />
                        )}
                        {counter != null && <span className={styles.counter}>{counter}</span>}
                        {actions != null && <span className={styles.actions}>{actions}</span>}
                    </div>
                )}
                {required && (
                    <span id={requiredId} hidden>
                        {labels.required}
                    </span>
                )}
                {layout === "group" ? (
                    controlContent
                ) : (
                    <div {...boxProps}>
                        {prefix != null && <span {...prefixProps}>{prefix}</span>}
                        {controlContent}
                        {ownerState.loading ? (
                            <span {...suffixProps}>
                                <Spinner className={styles.spinner} />
                            </span>
                        ) : (
                            suffix != null && <span {...suffixProps}>{suffix}</span>
                        )}
                    </div>
                )}
                {actionContent}
                {hasMessage && <div {...messageProps}>{message}</div>}
            </div>
        </FieldContext.Provider>
    );
});
