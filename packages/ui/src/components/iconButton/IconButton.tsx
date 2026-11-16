import { Button as BaseButton } from "@base-ui/react/button";
import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type ReactNode, type RefAttributes, type SyntheticEvent } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Spinner } from "../spinner/Spinner";
import styles from "./IconButton.module.scss";

type IconButtonVariant = "contained" | "outlined" | "text";
type IconButtonColor = "primary" | "secondary" | "error" | "success";
type IconButtonSize = "default" | "small";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type IconButtonOwnerState = {
    variant: IconButtonVariant;
    color: IconButtonColor;
    size: IconButtonSize;
    disabled: boolean;
    loading: boolean;
};

interface IconButtonSlots<Icon extends ElementType, LoadingSpinner extends ElementType> {
    /**
     * Element for the `icon` slot.
     *
     * @defaultValue `span`
     */
    icon?: Icon;
    /**
     * Element for the `loadingSpinner` slot.
     *
     * @defaultValue `Spinner`
     */
    loadingSpinner?: LoadingSpinner;
}

interface IconButtonSlotProps<Icon extends ElementType, LoadingSpinner extends ElementType> {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<IconButtonOwnerState, Icon>;
    /** Props for the `loadingSpinner` slot. */
    loadingSpinner?: SlotPropsValue<IconButtonOwnerState, LoadingSpinner>;
}

export interface IconButtonProps<Icon extends ElementType = "span", LoadingSpinner extends ElementType = typeof Spinner> extends Omit<
    BaseButton.Props,
    "className" | "ref"
> {
    /** Names the action, since the button shows no text. */
    "aria-label": string;
    /** The icon to show. */
    children?: ReactNode;
    /**
     * Visual emphasis: `contained` for the main action, `outlined` and `text` for less important ones.
     *
     * @defaultValue `"contained"`
     */
    variant?: IconButtonVariant;
    /**
     * Use `error` for destructive actions and `success` for confirming ones.
     *
     * @defaultValue `"primary"`
     */
    color?: IconButtonColor;
    /** @defaultValue `"default"` */
    size?: IconButtonSize;
    /**
     * Prevents interaction with the button.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows a spinner in place of the icon and ignores clicks.
     *
     * @defaultValue `false`
     */
    loading?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: IconButtonSlots<Icon, LoadingSpinner>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: IconButtonSlotProps<Icon, LoadingSpinner>;
}

function preventDefault(event: SyntheticEvent) {
    event.preventDefault();
}

/**
 * A button that shows only an icon, for actions that are clear without text.
 */
export const IconButton: <Icon extends ElementType = "span", LoadingSpinner extends ElementType = typeof Spinner>(
    props: IconButtonProps<Icon, LoadingSpinner> & RefAttributes<HTMLButtonElement>,
) => ReactNode = forwardRef(function IconButton<Icon extends ElementType = "span", LoadingSpinner extends ElementType = typeof Spinner>(
    {
        disabled,
        loading,
        type = "button",
        variant = "contained",
        color = "primary",
        size = "default",
        className,
        slots,
        slotProps,
        children,
        onClick,
        ...restProps
    }: IconButtonProps<Icon, LoadingSpinner>,
    ref: ForwardedRef<HTMLButtonElement>,
) {
    const ownerState: IconButtonOwnerState = { variant, color, size, disabled: disabled === true, loading: loading === true };

    const IconSlot: ElementType = slots?.icon ?? "span";
    const LoadingSpinnerSlot: ElementType = slots?.loadingSpinner ?? Spinner;

    const iconProps = resolveSlotProps<IconButtonOwnerState, Icon, "span">({
        ownProps: { className: styles.icon },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const loadingSpinnerProps = resolveSlotProps<IconButtonOwnerState, LoadingSpinner, typeof Spinner>({
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
            {ownerState.loading ? <LoadingSpinnerSlot {...loadingSpinnerProps} /> : <IconSlot {...iconProps}>{children}</IconSlot>}
        </BaseButton>
    );
});
