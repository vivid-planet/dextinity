import { clsx } from "clsx";
import {
    type CSSProperties,
    type ElementType,
    type ForwardedRef,
    forwardRef,
    type LabelHTMLAttributes,
    type PropsWithChildren,
    type ReactNode,
    type Ref,
    type RefAttributes,
    useId,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./FieldLabel.module.scss";
import { defaultInfoButtonLabel, InfoButton } from "./InfoButton";

const requiredMarker = "*";

type LabelElement = ElementType<{ htmlFor?: string; ref?: Ref<HTMLLabelElement> }>;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FieldLabelOwnerState = {
    required: boolean;
    error: boolean;
};

/**
 * Texts of the field label, for translation.
 */
export interface FieldLabelLabels {
    /** Accessible name of the info button that shows the `info`. */
    infoButton: string;
}

interface FieldLabelSlots<Label extends LabelElement, RequiredMarker extends ElementType, InfoIcon extends ElementType> {
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
     * Element for the `infoIcon` slot, the icon of the button that shows the `info`.
     *
     * @defaultValue `Icon` named `info`
     */
    infoIcon?: InfoIcon;
}

interface FieldLabelSlotProps<Label extends LabelElement, RequiredMarker extends ElementType, InfoIcon extends ElementType> {
    /** Props for the element around the label, other than `className` and `style`. */
    root?: SlotPropsValue<FieldLabelOwnerState, "span">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<FieldLabelOwnerState, Label>;
    /** Props for the `required` slot. */
    required?: SlotPropsValue<FieldLabelOwnerState, RequiredMarker>;
    /** Props for the `infoButton` slot, the info button after the label that shows the `info`. */
    infoButton?: SlotPropsValue<FieldLabelOwnerState, "button">;
    /** Props for the `infoIcon` slot. */
    infoIcon?: SlotPropsValue<FieldLabelOwnerState, InfoIcon>;
}

export interface FieldLabelProps<
    Label extends LabelElement = "label",
    RequiredMarker extends ElementType = "span",
    InfoIcon extends ElementType = typeof Icon,
>
    extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "className" | "style">, PropsWithChildren {
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
     * field's name; add `infoId` to the control's `aria-describedby` so it describes the control. Use it for background most users
     * don't need; what everyone needs belongs in a `FormHelperText` below the control.
     */
    info?: ReactNode;
    /**
     * The id of the hidden copy of the `info`, to add to the control's `aria-describedby`.
     *
     * @defaultValue generated
     */
    infoId?: string;
    /** Texts of the label, for translation. */
    labels?: Partial<FieldLabelLabels>;
    /** Added alongside the component's own classes on the element around the label. */
    className?: string;
    /** Inline styles for the element around the label. */
    style?: CSSProperties;
    /** Sets which element a named inner part renders as. */
    slots?: FieldLabelSlots<Label, RequiredMarker, InfoIcon>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldLabelSlotProps<Label, RequiredMarker, InfoIcon>;
}

/**
 * Names a form field. For a control without a `Field`; `Field` renders its own label with the same look.
 *
 * `children`: The label text.
 */
export const FieldLabel: <
    Label extends LabelElement = "label",
    RequiredMarker extends ElementType = "span",
    InfoIcon extends ElementType = typeof Icon,
>(
    props: FieldLabelProps<Label, RequiredMarker, InfoIcon> & RefAttributes<HTMLLabelElement>,
) => ReactNode = forwardRef(function FieldLabel<
    Label extends LabelElement = "label",
    RequiredMarker extends ElementType = "span",
    InfoIcon extends ElementType = typeof Icon,
>(
    {
        required,
        error,
        info,
        infoId: infoIdProp,
        labels: labelsProp,
        className,
        style,
        slots,
        slotProps,
        children,
        ...restProps
    }: FieldLabelProps<Label, RequiredMarker, InfoIcon>,
    ref: ForwardedRef<HTMLLabelElement>,
) {
    const generatedInfoId = `${useId()}info`;
    const infoId = infoIdProp ?? generatedInfoId;
    const labels: FieldLabelLabels = { infoButton: defaultInfoButtonLabel, ...labelsProp };
    const ownerState: FieldLabelOwnerState = { required: required === true, error: error === true };

    const LabelSlot: ElementType = slots?.label ?? "label";
    const RequiredSlot: ElementType = slots?.required ?? "span";

    const labelProps = resolveSlotProps<FieldLabelOwnerState, Label, "label">({
        ownProps: { ...restProps, ref, className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const requiredProps = resolveSlotProps<FieldLabelOwnerState, RequiredMarker, "span">({
        ownProps: { className: styles.required, "aria-hidden": true, children: requiredMarker },
        slotProps: slotProps?.required,
        ownerState,
    });
    const infoButtonProps = resolveSlotProps<FieldLabelOwnerState, "button", "button">({
        ownProps: { className: styles.infoButton, "aria-label": labels.infoButton },
        slotProps: slotProps?.infoButton,
        ownerState,
    });
    const infoIconProps = resolveSlotProps<FieldLabelOwnerState, InfoIcon, typeof Icon>({
        ownProps: { name: "info" },
        slotProps: slotProps?.infoIcon,
        ownerState,
    });

    const rootProps = resolveSlotProps<FieldLabelOwnerState, "span", "span">({
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
            {info != null && info !== "" && (
                <InfoButton info={info} infoId={infoId} buttonProps={infoButtonProps} IconSlot={slots?.infoIcon ?? Icon} iconProps={infoIconProps} />
            )}
        </span>
    );
});
