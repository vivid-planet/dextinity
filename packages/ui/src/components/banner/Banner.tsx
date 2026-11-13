import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import type { IconName } from "../icon/iconRegistry";
import styles from "./Banner.module.scss";

type BannerTone = "warning" | "error" | "info";

const toneIcons: Record<BannerTone, IconName> = {
    warning: "warn-tri",
    error: "alert",
    info: "info",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type BannerOwnerState = {
    tone: BannerTone;
};

export interface BannerSlotProps {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<BannerOwnerState, "span">;
    /** Props for the `message` slot. */
    message?: SlotPropsValue<BannerOwnerState, "span">;
    /** Props for the `action` slot. */
    action?: SlotPropsValue<BannerOwnerState, "span">;
}

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** What is wrong and what happens now, e.g. "No connection. Changes stay here until they are saved." */
    children: ReactNode;
    /**
     * `warning` for a passing problem the page can live with (announced politely), `error` for one that blocks work (announced
     * at once), `info` for a notice.
     *
     * @defaultValue `"warning"`
     */
    tone?: BannerTone;
    /** Replaces the tone's icon. */
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
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
    { children, tone = "warning", icon, action, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: BannerOwnerState = { tone };

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
            role={ownerState.tone === "error" ? "alert" : "status"}
            {...restProps}
            ref={ref}
            data-tone={ownerState.tone}
            className={clsx(styles.root, className)}
        >
            <span {...iconProps}>{icon ?? <Icon name={toneIcons[ownerState.tone]} />}</span>
            <span {...messageProps}>{children}</span>
            {action != null && <span {...actionProps}>{action}</span>}
        </div>
    );
});
