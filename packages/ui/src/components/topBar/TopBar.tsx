import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { useAppShellContext } from "../appShell/appShellContext";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { useAriaKeyShortcuts } from "../keyboardShortcut/useAriaKeyShortcuts";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./TopBar.module.scss";

export interface TopBarLabels {
    /** The search trigger's text and accessible name. */
    search: string;
    /** The menu button that opens the navigation on narrow windows. */
    menu: string;
}

const defaultLabels: TopBarLabels = {
    search: "Search, jump, create …",
    menu: "Open navigation",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TopBarOwnerState = Record<string, never>;

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "title"> {
    /** Opens the command palette; shows the search trigger at the start of the bar. */
    onSearchClick?: () => void;
    /**
     * The keyboard shortcut shown in the search trigger's tooltip, in the notation of `useKeyboardShortcut`. Shortcuts show only in
     * overlays, never as key caps in the bar. It only shows the hint; the `CommandPalette` listens to the shortcut.
     *
     * @defaultValue `"mod+k"`
     */
    searchKeyboardShortcut?: string;
    /** The scope picker, usually a `ScopeSwitcher`. The scope is global, so it lives only here. */
    scope?: ReactNode;
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
 * The glass bar above the content: search, the app's own actions, scope, and user menu. It looks the same on every page; a page's own
 * back and actions belong in its `PageHeader`. The app name never appears here, only in the navigation.
 */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
    {
        onSearchClick,
        searchKeyboardShortcut = "mod+k",
        scope,
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
    const onMenuClick = onMenuClickProp ?? shell?.onNavDrawerOpen;
    const searchKeyShortcuts = useAriaKeyShortcuts(searchKeyboardShortcut);

    return (
        <header {...restProps} ref={ref} className={clsx(styles.root, className)}>
            {onMenuClick != null && (
                <IconButton variant="text" color="secondary" aria-label={labels.menu} onClick={onMenuClick} className={styles.menuButton}>
                    <Icon name="menu" />
                </IconButton>
            )}
            {onSearchClick != null && (
                <Tooltip content={labels.search} keyboardShortcut={searchKeyboardShortcut}>
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
                    </button>
                </Tooltip>
            )}
            <div className={styles.actions}>
                {browseActions}
                {scope}
                {userMenu}
            </div>
        </header>
    );
});
