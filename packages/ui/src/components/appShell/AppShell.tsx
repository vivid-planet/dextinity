import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { useKeyboardShortcut } from "../keyboardShortcut/useKeyboardShortcut";
import styles from "./AppShell.module.scss";
import { AppShellContext, type AppShellContextValue } from "./appShellContext";
import { useMediaQuery } from "./useMediaQuery";

const narrowQuery = "(width < 768px)";
const mediumQuery = "(width < 1280px)";
const navCollapseKeyboardShortcut = "mod+\\";

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

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children">, PropsWithChildren {
    /** The navigation, usually a `SideNav` without `collapsed` and `onCollapsedChange`, which then follows the shell. */
    nav: ReactNode;
    /**
     * The top bar, usually a `TopBar`; it sticks to the top. Without `onMenuClick`, its menu button opens the navigation drawer.
     */
    topBar: ReactNode;
    /**
     * Whether the navigation shows only icons. A user setting for wide windows; on medium windows the navigation starts collapsed,
     * and expanding it lays it over the content until a page is picked.
     */
    navCollapsed: boolean;
    /** Called to collapse or expand the navigation, with its footer button or ⌘\ / Ctrl+\. */
    onNavCollapsedChange: (collapsed: boolean) => void;
    /** Leaves out the shortcut ⌘\ / Ctrl+\, e.g. when the app handles it itself. */
    disableKeyboardShortcuts?: boolean;
    /** The built-in texts. */
    labels?: Partial<AppShellLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: AppShellSlotProps;
}

/**
 * The frame of every admin app: navigation, top bar, and content, as glass panels over the ambient light field. It stays in place
 * when the page changes and adapts to the window width: the navigation collapses to icons, then moves into a drawer. On medium
 * windows, the collapsed navigation can still be expanded; it then lies over the content instead of pushing it aside.
 *
 * `children`: The page: page header, then panels.
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
    {
        nav,
        topBar,
        children,
        navCollapsed,
        onNavCollapsedChange,
        disableKeyboardShortcuts = false,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const narrow = useMediaQuery(narrowQuery);
    const medium = useMediaQuery(mediumQuery);
    const layout: AppShellLayout = narrow ? "narrow" : medium ? "medium" : "wide";
    const ownerState: AppShellOwnerState = { layout, navCollapsed };
    const [navDrawerOpen, setNavDrawerOpen] = useState(false);
    const [navOverlayOpen, setNavOverlayOpen] = useState(false);
    const [overlayLayout, setOverlayLayout] = useState(layout);
    // The navigation opened over the content on a medium window closes when the window leaves that size
    if (overlayLayout !== layout) {
        setOverlayLayout(layout);
        setNavOverlayOpen(false);
    }
    const navRef = useRef<HTMLDivElement>(null);
    const restoreNavFocusRef = useRef(false);
    const { anchorRef, container } = useThemePortalContainer<HTMLSpanElement>();

    const isMedium = layout === "medium";
    const columnNavCollapsed = isMedium ? !navOverlayOpen : navCollapsed;
    const changeColumnNavCollapsed = isMedium ? (collapsed: boolean) => setNavOverlayOpen(!collapsed) : onNavCollapsedChange;
    const navCollapseShortcutEnabled = !disableKeyboardShortcuts && layout !== "narrow";
    useKeyboardShortcut(navCollapseKeyboardShortcut, () => changeColumnNavCollapsed(!columnNavCollapsed), {
        enabled: navCollapseShortcutEnabled,
    });

    // Like a popup, the navigation over the content closes on Escape and on a press outside it
    useEffect(() => {
        if (!isMedium || !navOverlayOpen) {
            return;
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                // Collapsing replaces the entries, so the focus would fall back to the page if it was on one of them
                restoreNavFocusRef.current = navRef.current?.contains(document.activeElement) ?? false;
                setNavOverlayOpen(false);
            }
        }
        function handlePointerDown(event: PointerEvent) {
            if (event.target instanceof Node && !navRef.current?.contains(event.target)) {
                setNavOverlayOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [isMedium, navOverlayOpen]);

    useEffect(() => {
        if (!navOverlayOpen && restoreNavFocusRef.current) {
            restoreNavFocusRef.current = false;
            navRef.current?.querySelector<HTMLElement>(".dextinitySideNav__collapseButton")?.focus();
        }
    }, [navOverlayOpen]);

    const columnContext: AppShellContextValue = {
        navCollapsed: columnNavCollapsed,
        onNavCollapsedChange: layout === "narrow" ? undefined : changeColumnNavCollapsed,
        onNavigate: isMedium ? () => setNavOverlayOpen(false) : undefined,
        navCollapseKeyboardShortcut: navCollapseShortcutEnabled ? navCollapseKeyboardShortcut : undefined,
    };
    const drawerContext: AppShellContextValue = { navCollapsed: false, onNavigate: () => setNavDrawerOpen(false) };
    const mainContext: AppShellContextValue = {
        navCollapsed: navCollapsed || isMedium,
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
            data-navoverlay={isMedium && navOverlayOpen ? "" : undefined}
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
                    <div ref={navRef} className={styles.nav}>
                        {nav}
                    </div>
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
