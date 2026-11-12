import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { useAppShellContext } from "../appShell/appShellContext";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { KeyboardKey } from "../keyboardKey/KeyboardKey";
import styles from "./TopBar.module.scss";
import { useTopBarEditState } from "./topBarEdit";

type TopBarMode = "browse" | "edit";

export interface TopBarLabels {
    /** The search trigger's text and accessible name. */
    search: string;
    /** The search trigger's keyboard hint. */
    searchShortcut: string;
    /** The menu button that opens the navigation on narrow windows. */
    menu: string;
}

const defaultLabels: TopBarLabels = {
    search: "Search, jump, create …",
    searchShortcut: "⌘K",
    menu: "Open navigation",
};

/**
 * Where the back button of the `edit` mode leads.
 */
export interface TopBarBack {
    /** Accessible name and tooltip, e.g. "Back to job ads". */
    label: string;
    /** Navigates back, e.g. to the list the edited item belongs to. */
    onClick: () => void;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TopBarOwnerState = {
    mode: TopBarMode;
};

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "title"> {
    /**
     * `browse` shows search, scope, and user menu; `edit` replaces them with the back button, the title, and the editing
     * actions. Leave it unset to follow the page: `edit` while a page sets it with `useTopBarEdit`, `browse` otherwise.
     */
    mode?: TopBarMode;
    /** Opens the command palette; shows the search trigger at the start of the bar. */
    onSearchClick?: () => void;
    /** The scope picker, usually a `ScopeSwitcher`. The scope is global, so it lives only here. */
    scope?: ReactNode;
    /**
     * Only in `browse`: the app's own controls, before the scope, e.g. a popover with the status of the site's builds. Keep them few
     * and compact, e.g. icon buttons.
     */
    browseActions?: ReactNode;
    /** The user menu, usually a `UserMenu`. */
    userMenu?: ReactNode;
    /** Only in `edit`: the back button at the start. Without it, the one set with `useTopBarEdit` shows. */
    back?: TopBarBack;
    /** Only in `edit`: what is edited, e.g. the page's name, after the back button. Without it, the one set with `useTopBarEdit` shows. */
    title?: ReactNode;
    /**
     * Only in `edit`: save state, preview, more actions, and Save, the bar's only primary action. Without them, the ones set with
     * `useTopBarEdit` show.
     */
    actions?: ReactNode;
    /** Shows the menu button on narrow windows. Inside `AppShell`, leave it unset: the button opens the navigation drawer. */
    onMenuClick?: () => void;
    /** The built-in texts. */
    labels?: Partial<TopBarLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * The glass bar above the content: search, the app's own actions, scope, and user menu while browsing; back and the editing actions while
 * editing. The app name never appears here, only in the navigation.
 */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
    {
        mode: modeProp,
        onSearchClick,
        scope,
        browseActions,
        userMenu,
        back: backProp,
        title: titleProp,
        actions: actionsProp,
        onMenuClick: onMenuClickProp,
        labels: labelsProp,
        className,
        ...restProps
    },
    ref,
) {
    const shell = useAppShellContext();
    const edit = useTopBarEditState();
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: TopBarOwnerState = { mode: modeProp ?? (edit != null ? "edit" : "browse") };
    const back = backProp ?? edit?.back;
    const title = titleProp ?? edit?.title;
    const actions = actionsProp ?? edit?.actions;
    const onMenuClick = onMenuClickProp ?? shell?.onNavDrawerOpen;

    return (
        <header {...restProps} ref={ref} data-mode={ownerState.mode} className={clsx(styles.root, className)}>
            {onMenuClick != null && (
                <IconButton variant="text" color="secondary" aria-label={labels.menu} onClick={onMenuClick} className={styles.menuButton}>
                    <Icon name="hamburger" />
                </IconButton>
            )}
            {ownerState.mode === "edit" ? (
                <>
                    {back != null && (
                        <IconButton variant="text" color="secondary" aria-label={back.label} onClick={back.onClick} className={styles.backButton}>
                            <Icon name="arrow-left" />
                        </IconButton>
                    )}
                    {title != null && <div className={styles.title}>{title}</div>}
                    <div className={styles.actions}>{actions}</div>
                </>
            ) : (
                <>
                    {onSearchClick != null && (
                        <button type="button" aria-label={labels.search} aria-haspopup="dialog" onClick={onSearchClick} className={styles.search}>
                            <Icon name="search" />
                            <span className={styles.searchText}>{labels.search}</span>
                            <KeyboardKey className={styles.searchShortcut}>{labels.searchShortcut}</KeyboardKey>
                        </button>
                    )}
                    <div className={styles.actions}>
                        {browseActions}
                        {scope}
                        {userMenu}
                    </div>
                </>
            )}
        </header>
    );
});
