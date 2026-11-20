import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type PropsWithChildren, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import type { IconName } from "../icon/iconRegistry";
import styles from "./Banner.module.scss";

type BannerColor = "warning" | "error" | "info";

const colorIcons: Record<BannerColor, IconName> = {
    warning: "warning-triangle",
    error: "alert",
    info: "info",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BannerOwnerState = {
    color: BannerColor;
};

export interface BannerSlotProps {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<BannerOwnerState, "span">;
    /** Props for the `message` slot. */
    message?: SlotPropsValue<BannerOwnerState, "span">;
    /** Props for the `action` slot. */
    action?: SlotPropsValue<BannerOwnerState, "span">;
}

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "color">, PropsWithChildren {
    /**
     * `warning` for a passing problem the page can live with (announced politely), `error` for one that blocks work (announced
     * at once), `info` for a notice.
     *
     * @defaultValue `"warning"`
     */
    color?: BannerColor;
    /** Replaces the icon of the color. */
    icon?: ReactNode;
    /** The way out, usually a small `Button` such as "Try again". */
    action?: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: BannerSlotProps;
}

/**
 * A message above the content about the whole page, e.g. a lost connection. Field errors stay at the field, action results go in
 * a toast.
 *
 * `children`: What is wrong and what happens now, e.g. "No connection. Changes stay here until they are saved."
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
    { children, color = "warning", icon, action, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: BannerOwnerState = { color };

    const iconProps = resolveSlotProps<BannerOwnerState, "span", "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const messageProps = resolveSlotProps<BannerOwnerState, "span", "span">({
        ownProps: { className: styles.message },
        slotProps: slotProps?.message,
        ownerState,
    });
    const actionProps = resolveSlotProps<BannerOwnerState, "span", "span">({
        ownProps: { className: styles.action },
        slotProps: slotProps?.action,
        ownerState,
    });

    return (
        <div
            role={ownerState.color === "error" ? "alert" : "status"}
            {...restProps}
            ref={ref}
            data-color={ownerState.color}
            className={clsx(styles.root, className)}
        >
            <span {...iconProps}>{icon ?? <Icon name={colorIcons[ownerState.color]} />}</span>
            <span {...messageProps}>{children}</span>
            {action != null && <span {...actionProps}>{action}</span>}
        </div>
    );
});
