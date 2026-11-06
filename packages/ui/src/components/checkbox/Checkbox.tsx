import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { type ControlValidationProps, useControlValidation } from "../field/controlValidation";
import type { FieldState } from "../field/Field";
import { Icon } from "../icon/Icon";
import styles from "./Checkbox.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CheckboxOwnerState = {
    checked: boolean;
    indeterminate: boolean;
    disabled: boolean;
    required: boolean;
    state: FieldState;
};

export interface CheckboxSlotProps {
    /** Props for the `row` slot, the clickable row of the box and the label. */
    row?: SlotPropsValue<CheckboxOwnerState, "label">;
    /** Props for the `control` slot, the box that holds the checkbox's role and focus. */
    control?: SlotPropsValue<CheckboxOwnerState, typeof BaseCheckbox.Root>;
    /** Props for the `indicator` slot, the check mark or dash inside the box. */
    indicator?: SlotPropsValue<CheckboxOwnerState, typeof BaseCheckbox.Indicator>;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<CheckboxOwnerState, "span">;
    /** Props for the `message` slot, the validation message below the checkbox. */
    message?: SlotPropsValue<CheckboxOwnerState, "div">;
}

export interface CheckboxProps extends ControlValidationProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange"> {
    /** The label. Without a visible label, set `aria-label`. */
    children?: ReactNode;
    /** Whether the checkbox is checked. */
    checked: boolean;
    /** Called with the new state when the checkbox is toggled. */
    onChange: (checked: boolean) => void;
    /**
     * Shows a dash for a partial selection, e.g. on a "Select all" checkbox when only some items are selected. Takes precedence over
     * `checked` visually; toggling still calls `onChange` with the negated `checked`.
     *
     * @defaultValue `false`
     */
    indeterminate?: boolean;
    /**
     * Prevents interaction with the checkbox.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Requires the checkbox to be checked before a form is submitted, and adds a star after the label.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /** Identifies the field when a form is submitted. */
    name?: string;
    /** The value submitted with the form while the checkbox is checked. */
    value?: string;
    /** The accessible name when there is no visible label. Required without `children`. */
    "aria-label"?: string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CheckboxSlotProps;
}

/**
 * Selects an item, for multiple selection in lists, the page tree, and assets.
 */
export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(function Checkbox(
    {
        children,
        checked,
        onChange,
        indeterminate = false,
        disabled = false,
        required = false,
        state = "default",
        validationMessage,
        name,
        value,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: CheckboxOwnerState = { checked, indeterminate, disabled, required, state };
    const validation = useControlValidation(state, validationMessage, ariaDescribedBy);

    const controlProps = resolveSlotProps<CheckboxOwnerState, typeof BaseCheckbox.Root, typeof BaseCheckbox.Root>({
        ownProps: {
            className: styles.control,
            checked,
            indeterminate,
            disabled,
            required,
            name,
            value,
            onCheckedChange: (nextChecked: boolean) => onChange(nextChecked),
            "aria-label": ariaLabel,
            "aria-invalid": validation["aria-invalid"],
            "aria-describedby": validation["aria-describedby"],
        },
        slotProps: slotProps?.control,
        ownerState,
    });
    const indicatorProps = resolveSlotProps<CheckboxOwnerState, typeof BaseCheckbox.Indicator, typeof BaseCheckbox.Indicator>({
        ownProps: { className: styles.indicator },
        slotProps: slotProps?.indicator,
        ownerState,
    });
    const rowProps = resolveSlotProps<CheckboxOwnerState, "label", "label">({
        ownProps: { className: styles.row },
        slotProps: slotProps?.row,
        ownerState,
    });
    const labelProps = resolveSlotProps<CheckboxOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const messageProps = resolveSlotProps<CheckboxOwnerState, "div", "div">({
        ownProps: { className: styles.message, id: validation.messageId },
        slotProps: slotProps?.message,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-checked={ownerState.checked ? "" : undefined}
            data-indeterminate={ownerState.indeterminate ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-required={ownerState.required ? "" : undefined}
            data-state={ownerState.state}
            className={clsx(styles.root, className)}
        >
            <label {...rowProps}>
                <BaseCheckbox.Root {...controlProps}>
                    <BaseCheckbox.Indicator {...indicatorProps}>
                        {ownerState.indeterminate ? <span className={styles.indeterminateMark} /> : <Icon name="check" />}
                    </BaseCheckbox.Indicator>
                </BaseCheckbox.Root>
                {children != null && (
                    <span {...labelProps}>
                        {children}
                        {required && <span className={styles.required} aria-hidden />}
                    </span>
                )}
            </label>
            {validation.showsMessage && <div {...messageProps}>{validationMessage}</div>}
        </div>
    );
});
