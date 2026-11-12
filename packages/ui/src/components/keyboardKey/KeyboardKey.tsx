import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./KeyboardKey.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type KeyboardKeyOwnerState = Record<string, never>;

export interface KeyboardKeyProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /** The key or key combination, e.g. `⌘K` or `Esc`. */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A keyboard key shown as a key cap, e.g. `Esc` or `K`, rendered as a `<kbd>` element. Also takes a short key
 * combination written as one label, e.g. `⌘K`. Used for keyboard shortcuts in tooltips, menus, the command palette and
 * search fields; a shortcut pressed as a sequence of keys gets one `KeyboardKey` per key.
 */
export const KeyboardKey = forwardRef<HTMLElement, KeyboardKeyProps>(function KeyboardKey({ className, children, ...restProps }, ref) {
    return (
        <kbd {...restProps} ref={ref} className={clsx(styles.root, className)}>
            {children}
        </kbd>
    );
});
