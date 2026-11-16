import { clsx } from "clsx";
import {
    type CSSProperties,
    type ElementType,
    type ForwardedRef,
    forwardRef,
    type LabelHTMLAttributes,
    type ReactNode,
    type Ref,
    type RefAttributes,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./FormLabel.module.scss";

const requiredMarker = "*";

type LabelElement = ElementType<{ htmlFor?: string; ref?: Ref<HTMLLabelElement> }>;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FormLabelOwnerState = {
    required: boolean;
    error: boolean;
};

interface FormLabelSlots<Label extends LabelElement, RequiredMarker extends ElementType, HelperIcon extends ElementType> {
    /**
     * Element for the `label` slot.
     *
     * @defaultValue `label`
     */
    label?: Label;
    /**
     * Element for the `required` slot.
     *
     * @defaultValue `span`
     */
    required?: RequiredMarker;
    /**
     * Element for the `helperIcon` slot.
     *
     * @defaultValue `span`
     */
    helperIcon?: HelperIcon;
}

interface FormLabelSlotProps<Label extends LabelElement, RequiredMarker extends ElementType, HelperIcon extends ElementType> {
    /** Props for the element around the label, other than `className` and `style`. */
    root?: SlotPropsValue<FormLabelOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<FormLabelOwnerState, Label>;
    /** Props for the `required` slot. */
    required?: SlotPropsValue<FormLabelOwnerState, RequiredMarker>;
    /** Props for the `helperIcon` slot. */
    helperIcon?: SlotPropsValue<FormLabelOwnerState, HelperIcon>;
}

export interface FormLabelProps<
    Label extends LabelElement = "label",
    RequiredMarker extends ElementType = "span",
    HelperIcon extends ElementType = "span",
> extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "className" | "style"> {
    /**
     * Marks the field as required with an asterisk.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /**
     * Shows that the field's value is invalid.
     *
     * @defaultValue `false`
     */
    error?: boolean;
    /** Shown after the label and not part of the field's name, for example an info icon or a button that opens help. */
    helperIcon?: ReactNode;
    /** Added alongside the component's own classes on the element around the label. */
    className?: string;
    /** Inline styles for the element around the label. */
    style?: CSSProperties;
    /** Sets which element a named inner part renders as. */
    slots?: FormLabelSlots<Label, RequiredMarker, HelperIcon>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FormLabelSlotProps<Label, RequiredMarker, HelperIcon>;
}

/**
 * Names a form field.
 */
export const FormLabel: <Label extends LabelElement = "label", RequiredMarker extends ElementType = "span", HelperIcon extends ElementType = "span">(
    props: FormLabelProps<Label, RequiredMarker, HelperIcon> & RefAttributes<HTMLLabelElement>,
) => ReactNode = forwardRef(function FormLabel<
    Label extends LabelElement = "label",
    RequiredMarker extends ElementType = "span",
    HelperIcon extends ElementType = "span",
>(
    { required, error, helperIcon, className, style, slots, slotProps, children, ...restProps }: FormLabelProps<Label, RequiredMarker, HelperIcon>,
    ref: ForwardedRef<HTMLLabelElement>,
) {
    const ownerState: FormLabelOwnerState = { required: required === true, error: error === true };

    const LabelSlot: ElementType = slots?.label ?? "label";
    const RequiredSlot: ElementType = slots?.required ?? "span";
    const HelperIconSlot: ElementType = slots?.helperIcon ?? "span";

    const labelProps = resolveSlotProps<FormLabelOwnerState, Label, "label">({
        ownProps: { ...restProps, ref, className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const requiredProps = resolveSlotProps<FormLabelOwnerState, RequiredMarker, "span">({
        ownProps: { className: styles.required, "aria-hidden": true, children: requiredMarker },
        slotProps: slotProps?.required,
        ownerState,
    });
    const helperIconProps = resolveSlotProps<FormLabelOwnerState, HelperIcon, "span">({
        ownProps: { className: styles.helperIcon },
        slotProps: slotProps?.helperIcon,
        ownerState,
    });

    const rootProps = resolveSlotProps<FormLabelOwnerState, "span", "span">({
        ownProps: { className: clsx(styles.root, className), style },
        slotProps: slotProps?.root,
        ownerState,
    });

    return (
        <span {...rootProps} data-required={ownerState.required ? "" : undefined} data-error={ownerState.error ? "" : undefined}>
            <LabelSlot {...labelProps}>
                {children}
                {ownerState.required && <RequiredSlot {...requiredProps} />}
            </LabelSlot>
            {helperIcon != null && <HelperIconSlot {...helperIconProps}>{helperIcon}</HelperIconSlot>}
        </span>
    );
});
