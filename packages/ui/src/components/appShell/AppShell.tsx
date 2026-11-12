import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import styles from "./AppShell.module.scss";
import { AppShellContext, type AppShellContextValue } from "./appShellContext";
import { useMediaQuery } from "./useMediaQuery";

const narrowQuery = "(width < 768px)";
const mediumQuery = "(width < 1280px)";

type AppShellLayout = "wide" | "medium" | "narrow";

export interface AppShellLabels {
    /** Accessible name of the navigation drawer on narrow windows. */
    navigation: string;
}

const defaultLabels: AppShellLabels = {
    navigation: "Navigation",
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type AppShellOwnerState = {
    /** Follows the window width: `wide` from 1280px, `medium` from 768px, `narrow` below. */
    layout: AppShellLayout;
    navCollapsed: boolean;
};

export interface AppShellSlotProps {
    /** Props for the `main` slot, the content column with the top bar. */
    main?: SlotPropsValue<AppShellOwnerState, "main">;
}

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The navigation, usually a `SideNav` without `collapsed` and `onCollapsedChange`, which then follows the shell. */
    nav: ReactNode;
    /**
     * The top bar, usually a `TopBar`; it sticks to the top. Without `onMenuClick`, its menu button opens the navigation drawer.
     */
    topBar: ReactNode;
    /** The page: page header, then panels. */
    children: ReactNode;
    /** Whether the navigation shows only icons. A user setting; on medium windows the navigation is always collapsed. */
    navCollapsed: boolean;
    /** Called to collapse or expand the navigation, with its footer button or ⌘\ / Ctrl+\. */
    onNavCollapsedChange: (collapsed: boolean) => void;
    /** Leaves out the shortcut ⌘\, e.g. when the app handles it itself. */
    disableShortcuts?: boolean;
    /** The built-in texts. */
    labels?: Partial<AppShellLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: AppShellSlotProps;
}

/**
 * The frame of every admin app: navigation, top bar, and content, as glass panels over the ambient light field. It stays in place
 * when the page changes and adapts to the window width: the navigation collapses to icons, then moves into a drawer.
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
    { nav, topBar, children, navCollapsed, onNavCollapsedChange, disableShortcuts = false, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const narrow = useMediaQuery(narrowQuery);
    const medium = useMediaQuery(mediumQuery);
    const layout: AppShellLayout = narrow ? "narrow" : medium ? "medium" : "wide";
    const ownerState: AppShellOwnerState = { layout, navCollapsed };
    const [navDrawerOpen, setNavDrawerOpen] = useState(false);
    const { anchorRef, container } = useThemePortalContainer<HTMLSpanElement>();

    useEffect(() => {
        if (disableShortcuts) {
            return;
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (!(event.metaKey || event.ctrlKey)) {
                return;
            }
            if (event.key === "\\" && layout === "wide") {
                event.preventDefault();
                onNavCollapsedChange(!navCollapsed);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [disableShortcuts, layout, navCollapsed, onNavCollapsedChange]);

    const columnContext: AppShellContextValue = {
        navCollapsed: navCollapsed || layout === "medium",
        onNavCollapsedChange: layout === "wide" ? onNavCollapsedChange : undefined,
    };
    const drawerContext: AppShellContextValue = { navCollapsed: false, onNavigate: () => setNavDrawerOpen(false) };
    const mainContext: AppShellContextValue = {
        navCollapsed: columnContext.navCollapsed,
        onNavDrawerOpen: layout === "narrow" ? () => setNavDrawerOpen(true) : undefined,
    };

    const mainProps = resolveSlotProps<AppShellOwnerState, "main", "main">({
        ownProps: { className: styles.main },
        slotProps: slotProps?.main,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-layout={ownerState.layout}
            data-navcollapsed={ownerState.navCollapsed ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <span ref={anchorRef} hidden />
            <div className={styles.lightField} aria-hidden>
                <span />
            </div>
            {layout === "narrow" ? (
                <AppShellContext.Provider value={drawerContext}>
                    <BaseDialog.Root open={navDrawerOpen} onOpenChange={setNavDrawerOpen}>
                        <BaseDialog.Portal container={container}>
                            <BaseDialog.Backdrop className={styles.backdrop} />
                            <BaseDialog.Popup aria-label={labels.navigation} className={styles.navDrawer}>
                                {nav}
                            </BaseDialog.Popup>
                        </BaseDialog.Portal>
                    </BaseDialog.Root>
                </AppShellContext.Provider>
            ) : (
                <AppShellContext.Provider value={columnContext}>
                    <div className={styles.nav}>{nav}</div>
                </AppShellContext.Provider>
            )}
            <AppShellContext.Provider value={mainContext}>
                <main {...mainProps}>
                    <div className={styles.topBar}>{topBar}</div>
                    <div className={styles.content}>{children}</div>
                </main>
            </AppShellContext.Provider>
            <div className={styles.grain} aria-hidden />
        </div>
    );
});
