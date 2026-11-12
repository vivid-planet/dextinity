import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./KeyboardShortcut.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type KeyboardShortcutOwnerState = Record<string, never>;

export interface KeyboardShortcutProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /** The key or key combination, e.g. `⌘K` or `Esc`. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A keyboard shortcut shown as a key cap, e.g. `⌘K`, `Esc` or `K`, rendered as a `<kbd>` element. Used in tooltips,
 * menus, the command palette and search fields; a shortcut pressed as a sequence of keys gets one `KeyboardShortcut`
 * per key.
 */
export const KeyboardShortcut = forwardRef<HTMLElement, KeyboardShortcutProps>(function KeyboardShortcut({ className, children, ...restProps }, ref) {
    return (
        <kbd {...restProps} ref={ref} className={clsx(styles.root, className)}>
            {children}
        </kbd>
    );
});
