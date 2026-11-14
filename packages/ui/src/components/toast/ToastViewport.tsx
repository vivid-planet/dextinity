import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useEffect, useLayoutEffect, useRef, useState } from "react";

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

interface LeavingToast {
    toast: ToastData;
    /** The toast's index in the list before it was removed, so it keeps its element while it leaves. */
    index: number;
    top: number;
}

interface ToastViewportItemProps {
    toast: ToastData;
    onDismiss: (id: string) => void;
    toastProps?: Partial<ToastProps>;
    /** Set while the toast plays its exit animation after it was removed from `toasts`: the distance from the top of the list. */
    leavingTop?: number;
    onLeft: (id: string) => void;
    itemRef: (element: HTMLLIElement | null) => void;
}

function ToastViewportItem({ toast, onDismiss, toastProps, leavingTop, onLeft, itemRef }: ToastViewportItemProps) {
    const leaving = leavingTop != null;
    const elementRef = useRef<HTMLLIElement | null>(null);
    const onLeftRef = useRef(onLeft);
    useEffect(() => {
        onLeftRef.current = onLeft;
    }, [onLeft]);
    const [paused, setPaused] = useState(false);
    const onDismissRef = useRef(onDismiss);
    useEffect(() => {
        onDismissRef.current = onDismiss;
    }, [onDismiss]);
    const duration = toast.duration ?? (toast.action != null ? defaultDurationWithAction : defaultDuration);

    useEffect(() => {
        if (paused || leaving) {
            return;
        }
        const timeout = window.setTimeout(() => onDismissRef.current(toast.id), duration);
        return () => window.clearTimeout(timeout);
    }, [paused, leaving, duration, toast.id]);

    useEffect(() => {
        const element = elementRef.current;
        if (!leaving || element == null) {
            return;
        }
        let cancelled = false;
        // The exit transition starts with the ending style, by the next frame at the latest; the toast leaves the list once it has
        // finished
        const frame = requestAnimationFrame(() => {
            const animations = typeof element.getAnimations === "function" ? element.getAnimations() : [];
            Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
                if (!cancelled) {
                    onLeftRef.current(toast.id);
                }
            });
        });
        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
        };
    }, [leaving, toast.id]);

    return (
        <li
            ref={(element) => {
                elementRef.current = element;
                itemRef(element);
            }}
            className={styles.item}
            data-ending-style={leaving ? "" : undefined}
            style={leaving ? { insetBlockStart: leavingTop } : undefined}
            inert={leaving}
            aria-hidden={leaving || undefined}
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

    // Removed toasts stay rendered at their place until their exit animation has finished
    const itemElements = useRef(new Map<string, HTMLLIElement>());
    const itemTops = useRef(new Map<string, number>());
    const [shownToasts, setShownToasts] = useState(toasts);
    const [leaving, setLeaving] = useState<LeavingToast[]>([]);
    if (toasts !== shownToasts) {
        const ids = new Set(toasts.map((toast) => toast.id));
        const removed = shownToasts
            .map((toast, index): LeavingToast => ({ toast, index, top: itemTops.current.get(toast.id) ?? 0 }))
            .filter(({ toast }) => !ids.has(toast.id));
        setShownToasts(toasts);
        setLeaving((current) => [...current.filter(({ toast }) => !ids.has(toast.id)), ...removed]);
    }

    useLayoutEffect(() => {
        for (const [id, element] of itemElements.current) {
            if (!element.hasAttribute("data-ending-style")) {
                itemTops.current.set(id, element.offsetTop);
            }
        }
    });

    const items: Array<{ toast: ToastData; leavingTop?: number }> = toasts.map((toast) => ({ toast }));
    for (const { toast, index, top } of leaving) {
        items.splice(Math.min(index, items.length), 0, { toast, leavingTop: top });
    }

    return (
        <section {...restProps} ref={ref} aria-label={labels.region} className={clsx(styles.root, className)}>
            <ol {...listProps}>
                {items.map(({ toast, leavingTop }) => (
                    <ToastViewportItem
                        key={toast.id}
                        toast={toast}
                        onDismiss={onDismiss}
                        toastProps={slotProps?.toast}
                        leavingTop={leavingTop}
                        onLeft={(id) => {
                            itemTops.current.delete(id);
                            setLeaving((current) => current.filter((entry) => entry.toast.id !== id));
                        }}
                        itemRef={(element) => {
                            if (element != null) {
                                itemElements.current.set(toast.id, element);
                            } else {
                                itemElements.current.delete(toast.id);
                            }
                        }}
                    />
                ))}
            </ol>
        </section>
    );
});
