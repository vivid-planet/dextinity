import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { type ControlAriaProps, isAriaInvalid, useSingleChoiceFieldWarning } from "../field/ControlFrame";
import { useFieldContext } from "../field/fieldContext";
import styles from "./Switch.module.scss";

type SwitchSize = "default" | "small";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SwitchOwnerState = {
    size: SwitchSize;
    checked: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    invalid: boolean;
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
}

export interface SwitchProps
    extends ControlAriaProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange" | keyof ControlAriaProps> {
    /** The label, which names the switch even inside a `Field`. Without a visible label, set `aria-label`. */
    children?: ReactNode;
    /** A second line under the label, e.g. what the setting does or why it is disabled. */
    description?: ReactNode;
    /** Whether the switch is on. */
    checked: boolean;
    /** Called with the new state when the switch is toggled. */
    onChange: (checked: boolean) => void;
    /**
     * Prevents interaction with the switch. Say why in `description`. Ignored inside a `Field`, which takes it from its own `disabled`.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the state without letting the user change it. Ignored inside a `Field`, which takes it from its own `readOnly`.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /**
     * `small` in table rows and dense panels.
     *
     * @defaultValue `"default"`
     */
    size?: SwitchSize;
    /** Identifies the field when a form is submitted. */
    name?: string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SwitchSlotProps;
}

/**
 * Turns a setting on or off, for settings that take effect immediately or on save. For a validation message, e.g. on a switch that must
 * be on, put it in a `Field` with `layout="group"` and without `label`: the switch takes the field's message, state, `required`,
 * `disabled`, and `readOnly`, and its own text names it.
 */
export const Switch = forwardRef<HTMLDivElement, SwitchProps>(function Switch(
    {
        children,
        description,
        checked,
        onChange,
        disabled = false,
        readOnly = false,
        size = "default",
        name,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const fieldControl = useFieldContext()?.control;
    useSingleChoiceFieldWarning("Switch", children != null);
    const ownerState: SwitchOwnerState = {
        size,
        checked,
        disabled: fieldControl != null ? fieldControl.disabled : disabled,
        readOnly: fieldControl != null ? fieldControl.readOnly : readOnly,
        required: fieldControl?.required === true,
        invalid: isAriaInvalid(ariaInvalid) || fieldControl?.["aria-invalid"] === true,
    };
    const labelId = useId();
    const descriptionId = useId();
    const hasLabel = children != null;
    const hasDescription = description != null;
    // The switch's own text names it; the field's label names it only without text
    const labelledBy = ariaLabelledBy ?? (hasLabel ? labelId : fieldControl?.["aria-labelledby"]);

    const controlProps = resolveSlotProps<SwitchOwnerState, typeof BaseSwitch.Root, typeof BaseSwitch.Root>({
        ownProps: {
            className: styles.control,
            id: fieldControl?.id,
            checked,
            disabled: ownerState.disabled,
            readOnly: ownerState.readOnly,
            required: ownerState.required,
            name,
            onCheckedChange: (nextChecked: boolean) => onChange(nextChecked),
            "aria-label": ariaLabel,
            "aria-labelledby": labelledBy,
            "aria-describedby": clsx(hasDescription && descriptionId, fieldControl?.["aria-describedby"], ariaDescribedBy) || undefined,
            "aria-invalid": ownerState.invalid ? true : undefined,
        },
        slotProps: slotProps?.control,
        ownerState,
    });
    const rowProps = resolveSlotProps<SwitchOwnerState, "label", "label">({
        ownProps: { className: styles.row },
        slotProps: slotProps?.row,
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
            data-readonly={ownerState.readOnly ? "" : undefined}
            data-required={ownerState.required ? "" : undefined}
            data-invalid={ownerState.invalid ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <label {...rowProps}>
                {(hasLabel || hasDescription) && (
                    <span {...textProps}>
                        {hasLabel && (
                            <span {...labelProps}>
                                {children}
                                {ownerState.required && fieldControl?.["aria-labelledby"] == null && <span className={styles.required} aria-hidden />}
                            </span>
                        )}
                        {hasDescription && <span {...descriptionProps}>{description}</span>}
                    </span>
                )}
                <BaseSwitch.Root {...controlProps}>
                    <BaseSwitch.Thumb {...thumbProps} />
                </BaseSwitch.Root>
            </label>
        </div>
    );
});
