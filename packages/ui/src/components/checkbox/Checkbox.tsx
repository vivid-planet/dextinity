import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { type ControlAriaProps, isAriaInvalid } from "../field/ControlFrame";
import { useFieldContext } from "../field/fieldContext";
import { Icon } from "../icon/Icon";
import styles from "./Checkbox.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CheckboxOwnerState = {
    checked: boolean;
    indeterminate: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    invalid: boolean;
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
}

export interface CheckboxProps
    extends ControlAriaProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange" | keyof ControlAriaProps> {
    /** The label, which names the checkbox even inside a `Field`. Without a visible label, set `aria-label`. */
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
     * Prevents interaction with the checkbox. Ignored inside a `Field`, which takes it from its own `disabled`.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Identifies the field when a form is submitted. */
    name?: string;
    /** The value submitted with the form while the checkbox is checked. */
    value?: string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CheckboxSlotProps;
}

/**
 * Selects an item, for multiple selection in lists, the page tree, and assets. For a validation message, e.g. on a consent checkbox, put it
 * in a `Field` with `layout="group"`: the checkbox takes the field's message, state, `required`, and `disabled`, and keeps its own text as
 * its name.
 */
export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(function Checkbox(
    {
        children,
        checked,
        onChange,
        indeterminate = false,
        disabled = false,
        name,
        value,
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
    const ownerState: CheckboxOwnerState = {
        checked,
        indeterminate,
        disabled: fieldControl != null ? fieldControl.disabled : disabled,
        readOnly: fieldControl?.readOnly === true,
        required: fieldControl?.required === true,
        invalid: isAriaInvalid(ariaInvalid) || fieldControl?.["aria-invalid"] === true,
    };
    // The checkbox's own text names it; the field's label names it only without text
    const labelledBy = ariaLabelledBy ?? (children == null ? fieldControl?.["aria-labelledby"] : undefined);

    const controlProps = resolveSlotProps<CheckboxOwnerState, typeof BaseCheckbox.Root, typeof BaseCheckbox.Root>({
        ownProps: {
            className: styles.control,
            id: fieldControl?.id,
            checked,
            indeterminate,
            disabled: ownerState.disabled,
            readOnly: ownerState.readOnly,
            required: ownerState.required,
            name,
            value,
            onCheckedChange: (nextChecked: boolean) => onChange(nextChecked),
            "aria-label": ariaLabel,
            "aria-labelledby": labelledBy,
            "aria-invalid": ownerState.invalid ? true : undefined,
            "aria-describedby": clsx(fieldControl?.["aria-describedby"], ariaDescribedBy) || undefined,
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

    return (
        <div
            {...restProps}
            ref={ref}
            data-checked={ownerState.checked ? "" : undefined}
            data-indeterminate={ownerState.indeterminate ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-readonly={ownerState.readOnly ? "" : undefined}
            data-required={ownerState.required ? "" : undefined}
            data-invalid={ownerState.invalid ? "" : undefined}
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
                        {ownerState.required && fieldControl?.["aria-labelledby"] == null && <span className={styles.required} aria-hidden />}
                    </span>
                )}
            </label>
        </div>
    );
});
