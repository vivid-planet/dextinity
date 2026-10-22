import { Button as BaseButton } from "@base-ui/react/button";
import { clsx } from "clsx";
import type { ElementType, ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./Button.module.scss";

type ButtonVariant = "primary" | "secondary";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 *
 * @experimental
 */
export type ButtonOwnerState = {
    variant: ButtonVariant;
    disabled: boolean;
};

interface ButtonSlots<StartIcon extends ElementType, EndIcon extends ElementType> {
    /**
     * Element for the `startIcon` slot.
     *
     * @defaultValue `span`
     */
    startIcon?: StartIcon;
    /**
     * Element for the `endIcon` slot.
     *
     * @defaultValue `span`
     */
    endIcon?: EndIcon;
}

interface ButtonSlotProps<StartIcon extends ElementType, EndIcon extends ElementType> {
    /** Props for the `startIcon` slot. */
    startIcon?: SlotPropsValue<ButtonOwnerState, StartIcon>;
    /** Props for the `endIcon` slot. */
    endIcon?: SlotPropsValue<ButtonOwnerState, EndIcon>;
}

/** @experimental */
export interface ButtonProps<StartIcon extends ElementType = "span", EndIcon extends ElementType = "span">
    extends Omit<BaseButton.Props, "className"> {
    /**
     * Visual style.
     *
     * @defaultValue `"primary"`
     */
    variant?: ButtonVariant;
    /**
     * Prevents interaction with the button.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: ButtonSlots<StartIcon, EndIcon>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ButtonSlotProps<StartIcon, EndIcon>;
    /** The icon to render before the button's text. */
    startIcon?: ReactNode;
    /** The icon to render after the button's text. */
    endIcon?: ReactNode;
}

/**
 * A button for triggering actions.
 *
 * @experimental
 */
export function Button<StartIcon extends ElementType = "span", EndIcon extends ElementType = "span">({
    disabled = false,
    type = "button",
    variant = "primary",
    className,
    slots,
    slotProps,
    startIcon,
    endIcon,
    children,
    ...restProps
}: ButtonProps<StartIcon, EndIcon>) {
    const ownerState: ButtonOwnerState = { variant, disabled };

    const StartIconSlot: ElementType = slots?.startIcon ?? "span";
    const EndIconSlot: ElementType = slots?.endIcon ?? "span";

    const startIconProps = resolveSlotProps<ButtonOwnerState, StartIcon, "span">({ className: styles.startIcon }, slotProps?.startIcon, ownerState);
    const endIconProps = resolveSlotProps<ButtonOwnerState, EndIcon, "span">({ className: styles.endIcon }, slotProps?.endIcon, ownerState);

    return (
        <BaseButton
            {...restProps}
            type={type}
            disabled={ownerState.disabled}
            data-variant={ownerState.variant}
            className={clsx(styles.root, className)}
        >
            {startIcon != null && <StartIconSlot {...startIconProps}>{startIcon}</StartIconSlot>}
            {children}
            {endIcon != null && <EndIconSlot {...endIconProps}>{endIcon}</EndIconSlot>}
        </BaseButton>
    );
}
