import { Button as BaseButton } from "@base-ui/react/button";
import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type ReactNode, type RefAttributes, type SyntheticEvent } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Spinner } from "../spinner/Spinner";
import styles from "./Button.module.scss";

type ButtonVariant = "contained" | "outlined" | "text";
type ButtonColor = "primary" | "secondary" | "error" | "success";
type ButtonSize = "default" | "small";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ButtonOwnerState = {
    variant: ButtonVariant;
    color: ButtonColor;
    size: ButtonSize;
    disabled: boolean;
    loading: boolean;
};

interface ButtonSlots<StartIcon extends ElementType, EndIcon extends ElementType, LoadingSpinner extends ElementType> {
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
    /**
     * Element for the `loadingSpinner` slot.
     *
     * @defaultValue `Spinner`
     */
    loadingSpinner?: LoadingSpinner;
}

interface ButtonSlotProps<StartIcon extends ElementType, EndIcon extends ElementType, LoadingSpinner extends ElementType> {
    /** Props for the `startIcon` slot. */
    startIcon?: SlotPropsValue<ButtonOwnerState, StartIcon>;
    /** Props for the `endIcon` slot. */
    endIcon?: SlotPropsValue<ButtonOwnerState, EndIcon>;
    /** Props for the `loadingSpinner` slot. */
    loadingSpinner?: SlotPropsValue<ButtonOwnerState, LoadingSpinner>;
}

export interface ButtonProps<
    StartIcon extends ElementType = "span",
    EndIcon extends ElementType = "span",
    LoadingSpinner extends ElementType = typeof Spinner,
> extends Omit<BaseButton.Props, "className" | "ref"> {
    /**
     * Visual emphasis: `contained` for the main action, `outlined` and `text` for less important ones.
     *
     * @defaultValue `"contained"`
     */
    variant?: ButtonVariant;
    /**
     * Use `error` for destructive actions and `success` for confirming ones.
     *
     * @defaultValue `"primary"`
     */
    color?: ButtonColor;
    /** @defaultValue `"default"` */
    size?: ButtonSize;
    /**
     * Prevents interaction with the button.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows a spinner in place of the start icon and ignores clicks.
     *
     * @defaultValue `false`
     */
    loading?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: ButtonSlots<StartIcon, EndIcon, LoadingSpinner>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ButtonSlotProps<StartIcon, EndIcon, LoadingSpinner>;
    /** The icon to render before the button's text. */
    startIcon?: ReactNode;
    /** The icon to render after the button's text. */
    endIcon?: ReactNode;
}

function preventDefault(event: SyntheticEvent) {
    event.preventDefault();
}

/**
 * A button for triggering actions.
 */
export const Button: <
    StartIcon extends ElementType = "span",
    EndIcon extends ElementType = "span",
    LoadingSpinner extends ElementType = typeof Spinner,
>(
    props: ButtonProps<StartIcon, EndIcon, LoadingSpinner> & RefAttributes<HTMLButtonElement>,
) => ReactNode = forwardRef(function Button<
    StartIcon extends ElementType = "span",
    EndIcon extends ElementType = "span",
    LoadingSpinner extends ElementType = typeof Spinner,
>(
    {
        disabled = false,
        loading = false,
        type = "button",
        variant = "contained",
        color = "primary",
        size = "default",
        className,
        slots,
        slotProps,
        startIcon,
        endIcon,
        children,
        onClick,
        ...restProps
    }: ButtonProps<StartIcon, EndIcon, LoadingSpinner>,
    ref: ForwardedRef<HTMLButtonElement>,
) {
    const ownerState: ButtonOwnerState = { variant, color, size, disabled, loading };

    const StartIconSlot: ElementType = slots?.startIcon ?? "span";
    const EndIconSlot: ElementType = slots?.endIcon ?? "span";
    const LoadingSpinnerSlot: ElementType = slots?.loadingSpinner ?? Spinner;

    const startIconProps = resolveSlotProps<ButtonOwnerState, StartIcon, "span">({
        ownProps: { className: styles.startIcon },
        slotProps: slotProps?.startIcon,
        ownerState,
    });
    const endIconProps = resolveSlotProps<ButtonOwnerState, EndIcon, "span">({
        ownProps: { className: styles.endIcon },
        slotProps: slotProps?.endIcon,
        ownerState,
    });
    const loadingSpinnerProps = resolveSlotProps<ButtonOwnerState, LoadingSpinner, typeof Spinner>({
        ownProps: { className: styles.loadingSpinner },
        slotProps: slotProps?.loadingSpinner,
        ownerState,
    });

    return (
        <BaseButton
            {...restProps}
            ref={ref}
            type={type}
            disabled={ownerState.disabled}
            data-variant={ownerState.variant}
            data-color={ownerState.color}
            data-size={ownerState.size}
            data-loading={ownerState.loading ? "" : undefined}
            aria-busy={ownerState.loading || undefined}
            onClick={ownerState.loading ? preventDefault : onClick}
            className={clsx(styles.root, className)}
        >
            {ownerState.loading ? (
                <LoadingSpinnerSlot {...loadingSpinnerProps} />
            ) : (
                startIcon != null && <StartIconSlot {...startIconProps}>{startIcon}</StartIconSlot>
            )}
            {children}
            {endIcon != null && <EndIconSlot {...endIconProps}>{endIcon}</EndIconSlot>}
        </BaseButton>
    );
});
