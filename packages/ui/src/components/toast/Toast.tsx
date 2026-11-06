import { Button as BaseButton } from "@base-ui/react/button";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import type { IconName } from "../icon/iconRegistry";
import styles from "./Toast.module.scss";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastAction {
    /** The action, as a verb, e.g. "Undo". */
    label: string;
    /** Called when the action is clicked. */
    onClick: () => void;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ToastOwnerState = {
    tone: ToastTone;
};

export interface ToastSlotProps {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<ToastOwnerState, "span">;
    /** Props for the `message` slot. */
    message?: SlotPropsValue<ToastOwnerState, "span">;
    /** Props for the `action` slot. */
    action?: SlotPropsValue<ToastOwnerState, typeof BaseButton>;
}

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The result, not the process: "Saved – the change is live", not "Saving …". */
    message: string;
    /**
     * Sets the icon and its color: `success` confirms, `error` reports a failure, `warning` points out something to look at although the action went through, `info` informs.
     *
     * @defaultValue `"success"`
     */
    tone?: ToastTone;
    /** Replaces the tone's icon. */
    icon?: ReactNode;
    /** One action, usually "Undo", offered instead of asking for confirmation up front. */
    action?: ToastAction;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ToastSlotProps;
}

const toneIcons: Record<ToastTone, IconName> = {
    success: "check",
    error: "error",
    warning: "warning",
    info: "info",
};

/**
 * Confirms an action briefly, and offers to undo it instead of asking first. Show toasts with `ToastViewport`.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
    { message, tone = "success", icon, action, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: ToastOwnerState = { tone };

    const iconProps = resolveSlotProps<ToastOwnerState, "span", "span">({
        ownProps: { className: styles.icon, "aria-hidden": true },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const messageProps = resolveSlotProps<ToastOwnerState, "span", "span">({
        ownProps: { className: styles.message },
        slotProps: slotProps?.message,
        ownerState,
    });
    const actionProps = resolveSlotProps<ToastOwnerState, typeof BaseButton, typeof BaseButton>({
        ownProps: { className: styles.action, onClick: action?.onClick },
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
            <span {...messageProps}>{message}</span>
            {action != null && <BaseButton {...actionProps}>{action.label}</BaseButton>}
        </div>
    );
});
