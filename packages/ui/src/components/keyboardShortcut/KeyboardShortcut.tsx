import { clsx } from "clsx";
import { forwardRef, Fragment, type HTMLAttributes, type ReactNode } from "react";

import { describeShortcut, formatShortcut, type KeyboardShortcutLabels } from "./formatShortcut";
import styles from "./KeyboardShortcut.module.scss";
import { type KeyboardShortcutPlatform, useKeyboardShortcutLabels, useKeyboardShortcutPlatform } from "./keyboardShortcutPlatform";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type KeyboardShortcutOwnerState = {
    platform: KeyboardShortcutPlatform;
};

export interface KeyboardShortcutProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /**
     * The shortcut in the notation of `useKeyboardShortcut`, e.g. `"mod+k"`, `"shift+mod+n"` or `"Escape"`. It shows as the platform's
     * key caps, `⌘K` on Apple platforms and `Ctrl+K` elsewhere, and screen readers read its spoken name, e.g. "Command K".
     */
    shortcut?: string;
    /** Fixed text for keys the notation doesn't cover, e.g. `"Right-click"`. Only shown without `shortcut`. */
    children?: ReactNode;
    /** Shows the shortcut for this platform instead of the one of the nearest `KeyboardShortcutProvider` or the detected one. */
    platform?: KeyboardShortcutPlatform;
    /** The spoken names of keys; English defaults. */
    labels?: Partial<KeyboardShortcutLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A keyboard shortcut shown as a key cap, e.g. `⌘K`, `Esc` or `K`, rendered as a `<kbd>` element. Used in tooltips, menus, the
 * command palette and search fields; a shortcut pressed as a sequence of keys gets one `KeyboardShortcut` per key.
 *
 * With `shortcut`, `mod` shows as ⌘ on Apple platforms and as Ctrl elsewhere. The platform is detected after hydration, so server
 * rendering shows Ctrl first; a `KeyboardShortcutProvider` or `platform` sets it explicitly.
 */
export const KeyboardShortcut = forwardRef<HTMLElement, KeyboardShortcutProps>(function KeyboardShortcut(
    { shortcut, children, platform: platformProp, labels: labelsProp, className, ...restProps },
    ref,
) {
    const ownerState: KeyboardShortcutOwnerState = { platform: useKeyboardShortcutPlatform(platformProp) };
    const labels = useKeyboardShortcutLabels(labelsProp);

    if (shortcut == null) {
        return (
            <kbd {...restProps} ref={ref} className={clsx(styles.root, className)}>
                {children}
            </kbd>
        );
    }

    const apple = ownerState.platform === "apple";
    const caps = formatShortcut(shortcut, apple);

    return (
        <kbd {...restProps} ref={ref} data-platform={ownerState.platform} className={clsx(styles.root, className)}>
            <span aria-hidden className={styles.keys}>
                {caps.map((cap, index) => (
                    <Fragment key={index}>
                        {index > 0 && !apple && "+"}
                        <kbd className={styles.key}>{cap}</kbd>
                    </Fragment>
                ))}
            </span>
            <span className={styles.spoken}>{describeShortcut(shortcut, apple, labels)}</span>
        </kbd>
    );
});
