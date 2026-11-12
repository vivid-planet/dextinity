import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { useAppShellContext } from "../appShell/appShellContext";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { KeyboardShortcut } from "../keyboardShortcut/KeyboardShortcut";
import { useAriaKeyShortcuts } from "../keyboardShortcut/useAriaKeyShortcuts";
import styles from "./TopBar.module.scss";

export interface TopBarLabels {
    /** The search trigger's text and accessible name. */
    search: string;
    /** The AI assistant toggle. */
    ai: string;
    /** The menu button that opens the navigation on narrow windows. */
    menu: string;
}

const defaultLabels: TopBarLabels = {
    search: "Search, jump, create …",
    ai: "AI assistant",
    menu: "Open navigation",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TopBarOwnerState = {
    aiOpen: boolean;
};

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "title"> {
    /** Opens the command palette; shows the search trigger at the start of the bar. */
    onSearchClick?: () => void;
    /**
     * The keyboard shortcut shown in the search trigger, in the notation of `useKeyboardShortcut`. It only shows the hint; the
     * `CommandPalette` listens to the shortcut.
     *
     * @defaultValue `"mod+k"`
     */
    searchShortcut?: string;
    /** The scope picker, usually a `ScopeSwitcher`. The scope is global, so it lives only here. */
    scope?: ReactNode;
    /**
     * Whether the AI assistant is open.
     *
     * @defaultValue `false`
     */
    aiOpen?: boolean;
    /** Shows the AI assistant toggle. */
    onAiOpenChange?: (open: boolean) => void;
    /**
     * The app's own controls, before the scope, e.g. a popover with the status of the site's builds. Keep them few
     * and compact, e.g. icon buttons.
     */
    browseActions?: ReactNode;
    /** The user menu, usually a `UserMenu`. */
    userMenu?: ReactNode;
    /** Shows the menu button on narrow windows. Inside `AppShell`, leave it unset: the button opens the navigation drawer. */
    onMenuClick?: () => void;
    /** The built-in texts. */
    labels?: Partial<TopBarLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * The glass bar above the content: search, the app's own actions, scope, AI assistant, and user menu. It looks the same on every page; a page's own
 * back and actions belong in its `PageHeader`. The app name never appears here, only in the navigation.
 */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
    {
        onSearchClick,
        searchShortcut = "mod+k",
        scope,
        aiOpen = false,
        onAiOpenChange,
        browseActions,
        userMenu,
        onMenuClick: onMenuClickProp,
        labels: labelsProp,
        className,
        ...restProps
    },
    ref,
) {
    const shell = useAppShellContext();
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: TopBarOwnerState = { aiOpen };
    const onMenuClick = onMenuClickProp ?? shell?.onNavDrawerOpen;
    const searchKeyShortcuts = useAriaKeyShortcuts(searchShortcut);

    return (
        <header {...restProps} ref={ref} data-aiopen={ownerState.aiOpen ? "" : undefined} className={clsx(styles.root, className)}>
            {onMenuClick != null && (
                <IconButton variant="text" color="secondary" aria-label={labels.menu} onClick={onMenuClick} className={styles.menuButton}>
                    <Icon name="menu" />
                </IconButton>
            )}
            {onSearchClick != null && (
                <button
                    type="button"
                    aria-label={labels.search}
                    aria-keyshortcuts={searchKeyShortcuts}
                    aria-haspopup="dialog"
                    onClick={onSearchClick}
                    className={styles.search}
                >
                    <Icon name="search" />
                    <span className={styles.searchText}>{labels.search}</span>
                    <KeyboardShortcut className={styles.searchShortcut} shortcut={searchShortcut} />
                </button>
            )}
            <div className={styles.actions}>
                {browseActions}
                {scope}
                {onAiOpenChange != null && (
                    <button
                        type="button"
                        role="switch"
                        aria-checked={ownerState.aiOpen}
                        aria-label={labels.ai}
                        onClick={() => onAiOpenChange(!ownerState.aiOpen)}
                        className={styles.aiToggle}
                    >
                        <Icon name="artificial-intelligence" className={styles.aiIcon} />
                        <span className={styles.aiLabel}>{labels.ai}</span>
                        <span className={styles.aiTrack} />
                    </button>
                )}
                {userMenu}
            </div>
        </header>
    );
});
