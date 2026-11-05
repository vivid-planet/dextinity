import { Button as BaseButton } from "@base-ui/react/button";
import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type ReactNode, type RefAttributes, type SyntheticEvent } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Spinner } from "../spinner/Spinner";
import { Tooltip, type TooltipProps } from "../tooltip/Tooltip";
import styles from "./IconButton.module.scss";

type IconButtonVariant = "text" | "outlined";
type IconButtonSize = "default" | "small";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type IconButtonOwnerState = {
    variant: IconButtonVariant;
    size: IconButtonSize;
    disabled: boolean;
    loading: boolean;
};

export interface IconButtonSlots<Icon extends ElementType, LoadingSpinner extends ElementType> {
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

export interface IconButtonSlotProps<Icon extends ElementType, LoadingSpinner extends ElementType> {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<IconButtonOwnerState, Icon>;
    /** Props for the `loadingSpinner` slot. */
    loadingSpinner?: SlotPropsValue<IconButtonOwnerState, LoadingSpinner>;
    /** Props for the tooltip, e.g. its `placement`. */
    tooltip?: Partial<Omit<TooltipProps, "content" | "children" | "shortcut">>;
}

export interface IconButtonProps<Icon extends ElementType = "span", LoadingSpinner extends ElementType = typeof Spinner> extends Omit<
    BaseButton.Props,
    "className" | "ref" | "children"
> {
    /** The icon, e.g. `<Icon name="more" />`. */
    children: ReactNode;
    /** The accessible name of the button, also shown as its tooltip. Name the action, e.g. "More actions". */
    "aria-label": string;
    /** A keyboard shortcut for the action, shown in the tooltip, e.g. `⌘S`. */
    shortcut?: string;
    /**
     * Visual emphasis: `text` for toolbars and rows, `outlined` where the button stands alone on a surface.
     *
     * @defaultValue `"text"`
     */
    variant?: IconButtonVariant;
    /**
     * `small` in table rows, tree rows, and dense panels.
     *
     * @defaultValue `"default"`
     */
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
 * A button with only an icon. Its accessible name is also its tooltip, so every icon-only action explains itself.
 */
export const IconButton: <Icon extends ElementType = "span", LoadingSpinner extends ElementType = typeof Spinner>(
    props: IconButtonProps<Icon, LoadingSpinner> & RefAttributes<HTMLButtonElement>,
) => ReactNode = forwardRef(function IconButton<Icon extends ElementType = "span", LoadingSpinner extends ElementType = typeof Spinner>(
    {
        variant = "text",
        size = "default",
        disabled = false,
        loading = false,
        type = "button",
        shortcut,
        className,
        slots,
        slotProps,
        children,
        onClick,
        "aria-label": ariaLabel,
        ...restProps
    }: IconButtonProps<Icon, LoadingSpinner>,
    ref: ForwardedRef<HTMLButtonElement>,
) {
    const ownerState: IconButtonOwnerState = { variant, size, disabled, loading };

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
        <Tooltip {...slotProps?.tooltip} content={ariaLabel} shortcut={shortcut}>
            <BaseButton
                {...restProps}
                ref={ref}
                type={type}
                aria-label={ariaLabel}
                disabled={ownerState.disabled}
                data-variant={ownerState.variant}
                data-size={ownerState.size}
                data-loading={ownerState.loading ? "" : undefined}
                aria-busy={ownerState.loading || undefined}
                onClick={ownerState.loading ? preventDefault : onClick}
                className={clsx(styles.root, className)}
            >
                {ownerState.loading ? <LoadingSpinnerSlot {...loadingSpinnerProps} /> : <IconSlot {...iconProps}>{children}</IconSlot>}
            </BaseButton>
        </Tooltip>
    );
});
