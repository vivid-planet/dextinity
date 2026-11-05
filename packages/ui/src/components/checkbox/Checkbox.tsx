import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { clsx } from "clsx";
import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./Checkbox.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CheckboxOwnerState = {
    checked: boolean;
    indeterminate: boolean;
    disabled: boolean;
};

export interface CheckboxSlotProps {
    /** Props for the `control` slot, the box that holds the checkbox's role and focus. */
    control?: SlotPropsValue<CheckboxOwnerState, typeof BaseCheckbox.Root>;
    /** Props for the `indicator` slot, the check mark or dash inside the box. */
    indicator?: SlotPropsValue<CheckboxOwnerState, typeof BaseCheckbox.Indicator>;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<CheckboxOwnerState, "span">;
}

export interface CheckboxProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "className" | "children" | "onChange"> {
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
     * Requires the checkbox to be checked before a form is submitted.
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
export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(function Checkbox(
    {
        children,
        checked,
        onChange,
        indeterminate = false,
        disabled = false,
        required = false,
        name,
        value,
        "aria-label": ariaLabel,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: CheckboxOwnerState = { checked, indeterminate, disabled };

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
        },
        slotProps: slotProps?.control,
        ownerState,
    });
    const indicatorProps = resolveSlotProps<CheckboxOwnerState, typeof BaseCheckbox.Indicator, typeof BaseCheckbox.Indicator>({
        ownProps: { className: styles.indicator },
        slotProps: slotProps?.indicator,
        ownerState,
    });
    const labelProps = resolveSlotProps<CheckboxOwnerState, "span", "span">({
        ownProps: { className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });

    return (
        <label
            {...restProps}
            ref={ref}
            data-checked={ownerState.checked ? "" : undefined}
            data-indeterminate={ownerState.indeterminate ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <BaseCheckbox.Root {...controlProps}>
                <BaseCheckbox.Indicator {...indicatorProps}>
                    {ownerState.indeterminate ? <span className={styles.indeterminateMark} /> : <Icon name="check" />}
                </BaseCheckbox.Indicator>
            </BaseCheckbox.Root>
            {children != null && <span {...labelProps}>{children}</span>}
        </label>
    );
});
