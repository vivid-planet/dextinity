import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { type ControlValidationProps, useControlValidation } from "../field/controlValidation";
import type { FieldState } from "../field/Field";
import styles from "./Switch.module.scss";

type SwitchSize = "default" | "small";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SwitchOwnerState = {
    size: SwitchSize;
    checked: boolean;
    disabled: boolean;
    required: boolean;
    state: FieldState;
};

export interface SwitchSlotProps {
    /** Props for the `row` slot, the clickable row of the text and the track. */
    row?: SlotPropsValue<SwitchOwnerState, "label">;
    /** Props for the `control` slot, the track that holds the switch's role and focus. */
    control?: SlotPropsValue<SwitchOwnerState, typeof BaseSwitch.Root>;
    /** Props for the `thumb` slot. */
    thumb?: SlotPropsValue<SwitchOwnerState, typeof BaseSwitch.Thumb>;
    /** Props for the `text` slot, which holds the label and the description. */
    text?: SlotPropsValue<SwitchOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<SwitchOwnerState, "span">;
    /** Props for the `description` slot. */
    description?: SlotPropsValue<SwitchOwnerState, "span">;
    /** Props for the `message` slot, the validation message below the switch. */
    message?: SlotPropsValue<SwitchOwnerState, "div">;
}

export interface SwitchProps extends ControlValidationProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange"> {
    /** The label. Without a visible label, set `aria-label`. */
    children?: ReactNode;
    /** A second line under the label, e.g. what the setting does or why it is disabled. */
    description?: ReactNode;
    /** Whether the switch is on. */
    checked: boolean;
    /** Called with the new state when the switch is toggled. */
    onChange: (checked: boolean) => void;
    /**
     * Prevents interaction with the switch. Say why in `description`.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Requires the switch to be on, e.g. to accept terms, and adds a star after the label.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /** @defaultValue `"default"` */
    size?: SwitchSize;
    /** Identifies the field when a form is submitted. */
    name?: string;
    /** The accessible name when there is no visible label. */
    "aria-label"?: string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SwitchSlotProps;
}

/**
 * Turns a setting on or off, for settings that take effect immediately or on save.
 */
export const Switch = forwardRef<HTMLDivElement, SwitchProps>(function Switch(
    {
        children,
        description,
        checked,
        onChange,
        disabled = false,
        required = false,
        state = "default",
        validationMessage,
        size = "default",
        name,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: SwitchOwnerState = { size, checked, disabled, required, state };
    const labelId = useId();
    const descriptionId = useId();
    const hasLabel = children != null;
    const hasDescription = description != null;
    const validation = useControlValidation(state, validationMessage, clsx(hasDescription && descriptionId, ariaDescribedBy) || undefined);

    const controlProps = resolveSlotProps<SwitchOwnerState, typeof BaseSwitch.Root, typeof BaseSwitch.Root>({
        ownProps: {
            className: styles.control,
            checked,
            disabled,
            required,
            name,
            onCheckedChange: (nextChecked: boolean) => onChange(nextChecked),
            "aria-label": ariaLabel,
            "aria-labelledby": hasLabel ? labelId : undefined,
            "aria-describedby": validation["aria-describedby"],
            "aria-invalid": validation["aria-invalid"],
        },
        slotProps: slotProps?.control,
        ownerState,
    });
    const rowProps = resolveSlotProps<SwitchOwnerState, "label", "label">({
        ownProps: { className: styles.row },
        slotProps: slotProps?.row,
        ownerState,
    });
    const messageProps = resolveSlotProps<SwitchOwnerState, "div", "div">({
        ownProps: { className: styles.message, id: validation.messageId },
        slotProps: slotProps?.message,
        ownerState,
    });
    const thumbProps = resolveSlotProps<SwitchOwnerState, typeof BaseSwitch.Thumb, typeof BaseSwitch.Thumb>({
        ownProps: { className: styles.thumb },
        slotProps: slotProps?.thumb,
        ownerState,
    });
    const textProps = resolveSlotProps<SwitchOwnerState, "span", "span">({
        ownProps: { className: styles.text },
        slotProps: slotProps?.text,
        ownerState,
    });
    const labelProps = resolveSlotProps<SwitchOwnerState, "span", "span">({
        ownProps: { id: labelId, className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const descriptionProps = resolveSlotProps<SwitchOwnerState, "span", "span">({
        ownProps: { id: descriptionId, className: styles.description },
        slotProps: slotProps?.description,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-size={ownerState.size}
            data-checked={ownerState.checked ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-required={ownerState.required ? "" : undefined}
            data-state={ownerState.state}
            className={clsx(styles.root, className)}
        >
            <label {...rowProps}>
                {(hasLabel || hasDescription) && (
                    <span {...textProps}>
                        {hasLabel && (
                            <span {...labelProps}>
                                {children}
                                {required && <span className={styles.required} aria-hidden />}
                            </span>
                        )}
                        {hasDescription && <span {...descriptionProps}>{description}</span>}
                    </span>
                )}
                <BaseSwitch.Root {...controlProps}>
                    <BaseSwitch.Thumb {...thumbProps} />
                </BaseSwitch.Root>
            </label>
            {validation.showsMessage && <div {...messageProps}>{validationMessage}</div>}
        </div>
    );
});
