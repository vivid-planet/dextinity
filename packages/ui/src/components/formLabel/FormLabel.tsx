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
    useId,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./FormLabel.module.scss";
import { defaultHelpTextButtonLabel, HelpTextButton } from "./HelpTextButton";

const requiredMarker = "*";

type LabelElement = ElementType<{ htmlFor?: string; ref?: Ref<HTMLLabelElement> }>;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FormLabelOwnerState = {
    required: boolean;
    error: boolean;
};

/**
 * Texts of the form label, for translation.
 */
export interface FormLabelLabels {
    /** Accessible name of the info button that shows the `helpText`. */
    helpText: string;
}

interface FormLabelSlots<Label extends LabelElement, RequiredMarker extends ElementType, HelpIcon extends ElementType> {
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
     * Element for the `helpIcon` slot, the icon of the button that shows the `helpText`.
     *
     * @defaultValue `Icon` named `info`
     */
    helpIcon?: HelpIcon;
}

interface FormLabelSlotProps<Label extends LabelElement, RequiredMarker extends ElementType, HelpIcon extends ElementType> {
    /** Props for the element around the label, other than `className` and `style`. */
    root?: SlotPropsValue<FormLabelOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<FormLabelOwnerState, Label>;
    /** Props for the `required` slot. */
    required?: SlotPropsValue<FormLabelOwnerState, RequiredMarker>;
    /** Props for the `helpButton` slot, the info button after the label that shows the `helpText`. */
    helpButton?: SlotPropsValue<FormLabelOwnerState, "button">;
    /** Props for the `helpIcon` slot. */
    helpIcon?: SlotPropsValue<FormLabelOwnerState, HelpIcon>;
}

export interface FormLabelProps<
    Label extends LabelElement = "label",
    RequiredMarker extends ElementType = "span",
    HelpIcon extends ElementType = typeof Icon,
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
    /**
     * Extra explanation behind an info button after the label, shown in a tooltip on hover, keyboard focus, and tap. Not part of the
     * field's name; add `helpTextId` to the control's `aria-describedby` so it describes the control. Use it for background most users
     * don't need; what everyone needs belongs in a `FormHelperText` below the control.
     */
    helpText?: ReactNode;
    /**
     * The id of the hidden copy of the `helpText`, to add to the control's `aria-describedby`.
     *
     * @defaultValue generated
     */
    helpTextId?: string;
    /** Texts of the label, for translation. */
    labels?: Partial<FormLabelLabels>;
    /** Added alongside the component's own classes on the element around the label. */
    className?: string;
    /** Inline styles for the element around the label. */
    style?: CSSProperties;
    /** Sets which element a named inner part renders as. */
    slots?: FormLabelSlots<Label, RequiredMarker, HelpIcon>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FormLabelSlotProps<Label, RequiredMarker, HelpIcon>;
}

/**
 * Names a form field, for a custom layout without `Field`. `Field` renders its own label with the same look.
 */
export const FormLabel: <
    Label extends LabelElement = "label",
    RequiredMarker extends ElementType = "span",
    HelpIcon extends ElementType = typeof Icon,
>(
    props: FormLabelProps<Label, RequiredMarker, HelpIcon> & RefAttributes<HTMLLabelElement>,
) => ReactNode = forwardRef(function FormLabel<
    Label extends LabelElement = "label",
    RequiredMarker extends ElementType = "span",
    HelpIcon extends ElementType = typeof Icon,
>(
    {
        required,
        error,
        helpText,
        helpTextId: helpTextIdProp,
        labels: labelsProp,
        className,
        style,
        slots,
        slotProps,
        children,
        ...restProps
    }: FormLabelProps<Label, RequiredMarker, HelpIcon>,
    ref: ForwardedRef<HTMLLabelElement>,
) {
    const generatedHelpTextId = `${useId()}help`;
    const helpTextId = helpTextIdProp ?? generatedHelpTextId;
    const labels: FormLabelLabels = { helpText: defaultHelpTextButtonLabel, ...labelsProp };
    const ownerState: FormLabelOwnerState = { required: required === true, error: error === true };

    const LabelSlot: ElementType = slots?.label ?? "label";
    const RequiredSlot: ElementType = slots?.required ?? "span";

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
    const helpButtonProps = resolveSlotProps<FormLabelOwnerState, "button", "button">({
        ownProps: { className: styles.helpButton, "aria-label": labels.helpText },
        slotProps: slotProps?.helpButton,
        ownerState,
    });
    const helpIconProps = resolveSlotProps<FormLabelOwnerState, HelpIcon, typeof Icon>({
        ownProps: { name: "info" },
        slotProps: slotProps?.helpIcon,
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
            {helpText != null && helpText !== "" && (
                <HelpTextButton
                    helpText={helpText}
                    helpTextId={helpTextId}
                    buttonProps={helpButtonProps}
                    IconSlot={slots?.helpIcon ?? Icon}
                    iconProps={helpIconProps}
                />
            )}
        </span>
    );
});
