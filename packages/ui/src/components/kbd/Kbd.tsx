import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./Kbd.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type KbdOwnerState = Record<string, never>;

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /** The key or key combination, e.g. `⌘K` or `Esc`. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * Shows a keyboard key or shortcut, in tooltips, menus, the command palette, and search fields.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ className, children, ...restProps }, ref) {
    return (
        <kbd {...restProps} ref={ref} className={clsx(styles.root, className)}>
            {children}
        </kbd>
    );
});
