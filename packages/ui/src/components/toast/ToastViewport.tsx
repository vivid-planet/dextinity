import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useEffect, useRef, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Toast, type ToastProps } from "./Toast";
import styles from "./ToastViewport.module.scss";
import type { ToastData } from "./useToasts";

const defaultDuration = 5000;
const defaultDurationWithAction = 8000;

const defaultLabels = {
    region: "Notifications",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ToastViewportOwnerState = Record<string, never>;

export interface ToastViewportSlotProps {
    /** Props for the `list` slot. */
    list?: SlotPropsValue<ToastViewportOwnerState, "ol">;
    /** Props for every `toast` slot. */
    toast?: Partial<ToastProps>;
}

export interface ToastViewportProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /** The toasts to show, e.g. from `useToasts`. */
    toasts: ToastData[];
    /** Called with a toast's id when its duration has passed or its action was clicked. */
    onDismiss: (id: string) => void;
    /** The accessible name of the region, so screen reader users can jump to it. */
    labels?: Partial<typeof defaultLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ToastViewportSlotProps;
}

interface ToastViewportItemProps {
    toast: ToastData;
    onDismiss: (id: string) => void;
    toastProps?: Partial<ToastProps>;
}

function ToastViewportItem({ toast, onDismiss, toastProps }: ToastViewportItemProps) {
    const [paused, setPaused] = useState(false);
    const onDismissRef = useRef(onDismiss);
    useEffect(() => {
        onDismissRef.current = onDismiss;
    }, [onDismiss]);
    const duration = toast.duration ?? (toast.action != null ? defaultDurationWithAction : defaultDuration);

    useEffect(() => {
        if (paused) {
            return;
        }
        const timeout = window.setTimeout(() => onDismissRef.current(toast.id), duration);
        return () => window.clearTimeout(timeout);
    }, [paused, duration, toast.id]);

    return (
        <li
            className={styles.item}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            <Toast
                {...toastProps}
                role={toast.tone === "error" ? "alert" : undefined}
                message={toast.message}
                tone={toast.tone}
                icon={toast.icon}
                action={
                    toast.action == null
                        ? undefined
                        : {
                              label: toast.action.label,
                              onClick: () => {
                                  toast.action?.onClick();
                                  onDismiss(toast.id);
                              },
                          }
                }
            />
        </li>
    );
}

/**
 * Shows toasts at the bottom of the screen and dismisses each after its duration, paused while the pointer or focus is
 * on it. Place it once per app, inside the `Theme`, and hold its toasts with `useToasts`.
 */
export const ToastViewport = forwardRef<HTMLElement, ToastViewportProps>(function ToastViewport(
    { toasts, onDismiss, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: ToastViewportOwnerState = {};
    const labels = { ...defaultLabels, ...labelsProp };
    const listProps = resolveSlotProps<ToastViewportOwnerState, "ol", "ol">({
        ownProps: { className: styles.list, "aria-live": "polite" },
        slotProps: slotProps?.list,
        ownerState,
    });

    return (
        <section {...restProps} ref={ref} aria-label={labels.region} className={clsx(styles.root, className)}>
            <ol {...listProps}>
                {toasts.map((toast) => (
                    <ToastViewportItem key={toast.id} toast={toast} onDismiss={onDismiss} toastProps={slotProps?.toast} />
                ))}
            </ol>
        </section>
    );
});
