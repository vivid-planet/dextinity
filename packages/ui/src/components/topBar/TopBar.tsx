import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { useAppShellContext } from "../appShell/appShellContext";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { Kbd } from "../kbd/Kbd";
import styles from "./TopBar.module.scss";

type TopBarMode = "browse" | "edit";

export interface TopBarLabels {
    /** The search trigger's text and accessible name. */
    search: string;
    /** The search trigger's keyboard hint. */
    searchShortcut: string;
    /** The AI assistant toggle. */
    ai: string;
    /** The menu button that opens the navigation on narrow windows. */
    menu: string;
}

const defaultLabels: TopBarLabels = {
    search: "Search, jump, create …",
    searchShortcut: "⌘K",
    ai: "AI assistant",
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
    aiOpen: boolean;
};

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
    /**
     * `browse` shows search, scope, AI toggle, and user menu; `edit` replaces them with the back button and the editing actions.
     *
     * @defaultValue `"browse"`
     */
    mode?: TopBarMode;
    /** Opens the command palette; shows the search trigger at the start of the bar. */
    onSearchClick?: () => void;
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
    /** The user menu, usually a `UserMenu`. */
    userMenu?: ReactNode;
    /** Only in `edit`: the back button at the start. */
    back?: TopBarBack;
    /** Only in `edit`: save state, preview, more actions, and Save, the bar's only primary action. */
    actions?: ReactNode;
    /** Shows the menu button on narrow windows. Inside `AppShell`, leave it unset: the button opens the navigation drawer. */
    onMenuClick?: () => void;
    /** The built-in texts. */
    labels?: Partial<TopBarLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * The glass bar above the content: search, scope, AI assistant, and user menu while browsing; back and the editing actions while
 * editing. The app name never appears here, only in the navigation.
 */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
    {
        mode = "browse",
        onSearchClick,
        scope,
        aiOpen = false,
        onAiOpenChange,
        userMenu,
        back,
        actions,
        onMenuClick: onMenuClickProp,
        labels: labelsProp,
        className,
        ...restProps
    },
    ref,
) {
    const shell = useAppShellContext();
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: TopBarOwnerState = { mode, aiOpen };
    const onMenuClick = onMenuClickProp ?? shell?.onNavDrawerOpen;

    return (
        <header
            {...restProps}
            ref={ref}
            data-mode={ownerState.mode}
            data-aiopen={ownerState.aiOpen ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            {onMenuClick != null && (
                <IconButton aria-label={labels.menu} onClick={onMenuClick} className={styles.menuButton}>
                    <Icon name="menu" />
                </IconButton>
            )}
            {ownerState.mode === "edit" ? (
                <>
                    {back != null && (
                        <IconButton aria-label={back.label} onClick={back.onClick} className={styles.backButton}>
                            <Icon name="arrow-left" />
                        </IconButton>
                    )}
                    <div className={styles.actions}>{actions}</div>
                </>
            ) : (
                <>
                    {onSearchClick != null && (
                        <button type="button" aria-label={labels.search} aria-haspopup="dialog" onClick={onSearchClick} className={styles.search}>
                            <Icon name="search" />
                            <span className={styles.searchText}>{labels.search}</span>
                            <Kbd className={styles.searchShortcut}>{labels.searchShortcut}</Kbd>
                        </button>
                    )}
                    <div className={styles.actions}>
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
                                <Icon name="sparkle" className={styles.aiIcon} />
                                <span className={styles.aiLabel}>{labels.ai}</span>
                                <span className={styles.aiTrack} />
                            </button>
                        )}
                        {userMenu}
                    </div>
                </>
            )}
        </header>
    );
});
