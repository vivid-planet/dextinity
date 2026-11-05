import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode, useId } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./Chip.module.scss";

type ChipVariant = "filled" | "outlined";
type ChipColor = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
type ChipSize = "default" | "small";

export interface ChipLabels {
    /** Accessible name of the delete button; the chip's text is added as its description. */
    delete: string;
}

const defaultLabels: ChipLabels = { delete: "Remove" };

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ChipOwnerState = {
    variant: ChipVariant;
    color: ChipColor;
    size: ChipSize;
    disabled: boolean;
    clickable: boolean;
    deletable: boolean;
    selected: boolean;
};

export interface ChipSlotProps {
    /** Props for the `action` slot, the button that covers the chip when it is clickable. */
    action?: SlotPropsValue<ChipOwnerState, "button">;
    /** Props for the `delete` slot. */
    delete?: SlotPropsValue<ChipOwnerState, "button">;
    /** Props for the `label` slot. */
    label?: SlotPropsValue<ChipOwnerState, "span">;
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<ChipOwnerState, "span">;
    /** Props for the `avatar` slot. */
    avatar?: SlotPropsValue<ChipOwnerState, "span">;
}

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children" | "onClick"> {
    /** The label, one line. */
    children: ReactNode;
    /**
     * Visual style: `filled` with a soft background, `outlined` with a line only.
     *
     * @defaultValue `"filled"`
     */
    variant?: ChipVariant;
    /**
     * The color channel. `default` is neutral; use the others only where the color carries meaning, e.g. `info` for automatic values.
     *
     * @defaultValue `"default"`
     */
    color?: ChipColor;
    /**
     * `small` (24px) for labels in rows and cards.
     *
     * @defaultValue `"default"`
     */
    size?: ChipSize;
    /**
     * Prevents interaction with the chip.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Makes a clickable chip a toggle and sets whether it is on, e.g. an active filter. Requires `onClick`; leave it unset for a chip
     * that only triggers an action.
     */
    selected?: boolean;
    /** An icon before the label. Don't combine with `avatar`. */
    icon?: ReactNode;
    /** An avatar before the label. Don't combine with `icon`. */
    avatar?: ReactNode;
    /** Makes the chip clickable: the whole chip becomes a button. */
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    /** Makes the chip removable: shows a delete button, and Backspace or Delete on the focused chip removes it too. */
    onDelete?: (event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
    /** Texts for assistive technology. */
    labels?: Partial<ChipLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ChipSlotProps;
}

/**
 * A compact label for tags, filters, and selected values. It can be clickable, removable, or both.
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
    {
        children,
        variant = "filled",
        color = "default",
        size = "default",
        disabled = false,
        selected,
        icon,
        avatar,
        onClick,
        onDelete,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const ownerState: ChipOwnerState = {
        variant,
        color,
        size,
        disabled,
        clickable: onClick != null,
        deletable: onDelete != null,
        selected: onClick != null && selected === true,
    };
    const labels = { ...defaultLabels, ...labelsProp };
    const labelId = useId();

    const labelProps = resolveSlotProps<ChipOwnerState, "span", "span">({
        ownProps: { id: labelId, className: styles.label },
        slotProps: slotProps?.label,
        ownerState,
    });
    const actionProps = resolveSlotProps<ChipOwnerState, "button", "button">({
        ownProps: {
            type: "button",
            className: styles.action,
            disabled: ownerState.disabled,
            "aria-pressed": selected,
            onClick,
            onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
                if (onDelete != null && (event.key === "Backspace" || event.key === "Delete")) {
                    event.preventDefault();
                    onDelete(event);
                }
            },
        },
        slotProps: slotProps?.action,
        ownerState,
    });
    const deleteProps = resolveSlotProps<ChipOwnerState, "button", "button">({
        ownProps: {
            type: "button",
            className: styles.delete,
            disabled: ownerState.disabled,
            "aria-label": labels.delete,
            "aria-describedby": labelId,
            onClick: onDelete,
        },
        slotProps: slotProps?.delete,
        ownerState,
    });

    const iconProps = resolveSlotProps<ChipOwnerState, "span", "span">({
        ownProps: { className: styles.icon },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const avatarProps = resolveSlotProps<ChipOwnerState, "span", "span">({
        ownProps: { className: styles.avatar },
        slotProps: slotProps?.avatar,
        ownerState,
    });

    const content = (
        <>
            {icon != null && <span {...iconProps}>{icon}</span>}
            {avatar != null && <span {...avatarProps}>{avatar}</span>}
            <span {...labelProps}>{children}</span>
        </>
    );

    return (
        <span
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-color={ownerState.color}
            data-size={ownerState.size}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-clickable={ownerState.clickable ? "" : undefined}
            data-deletable={ownerState.deletable ? "" : undefined}
            data-selected={ownerState.selected ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            {ownerState.clickable ? <button {...actionProps}>{content}</button> : content}
            {ownerState.deletable && (
                <button {...deleteProps}>
                    <Icon name="close" />
                </button>
            )}
        </span>
    );
});
