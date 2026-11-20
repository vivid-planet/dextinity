import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import {
    forwardRef,
    type HTMLAttributes,
    type KeyboardEvent as ReactKeyboardEvent,
    type PropsWithChildren,
    type ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import type { EnvironmentLabelColor } from "../environmentLabel/EnvironmentLabel";
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
    /** Accessible name of the assistant column and of the assistant sheet on narrow windows. */
    assistant: string;
}

const defaultLabels: AppShellLabels = {
    navigation: "Navigation",
    assistant: "AI assistant",
};

// Moves focus into the assistant once its column has opened, so the focus doesn't jump while the column is still growing
const assistantFocusDelay = 280;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type AppShellOwnerState = {
    /** Follows the window width: `wide` from 1280px, `medium` from 768px, `narrow` below. */
    layout: AppShellLayout;
    navCollapsed: boolean;
    /** Whether the assistant is shown. */
    assistantOpen: boolean;
    /** Whether the app runs on another instance than the live system, which the shell marks. */
    environment: boolean;
};

/**
 * The instance an app runs on, e.g. Staging.
 */
export interface AppShellEnvironment {
    /** The name of the instance, e.g. "Staging". */
    label: string;
    /**
     * The instance's color, the warmer the closer it is to the live system: e.g. `info` for development, `success` for test,
     * `warning` for staging, and `error` for pre-live.
     *
     * @defaultValue `"warning"`
     */
    color?: EnvironmentLabelColor;
}

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
    /**
     * The AI assistant, e.g. a chat. It gets a column of its own at the end, so the page gets narrower instead of being covered; on
     * narrow windows it opens as a bottom sheet. It stays mounted while hidden, so a conversation is kept. Leave it out for users
     * without the right to use the assistant, together with the `AiAssistantSwitch`.
     */
    assistant?: ReactNode;
    /** Whether the assistant is shown. Toggled by the `AiAssistantSwitch` in the top bar and by ⌘J / Ctrl+J. */
    assistantOpen?: boolean;
    /** Called to show or hide the assistant: with the switch, ⌘J / Ctrl+J, or Escape inside the assistant. */
    onAssistantOpenChange?: (open: boolean) => void;
    /**
     * The instance the app runs on, e.g. Staging, so that nobody mistakes it for the live system. The shell draws a line in its color
     * along the top edge, and the `SideNav` and, on narrow windows, the `TopBar` show its `EnvironmentLabel`. Leave it out on the live
     * system.
     */
    environment?: AppShellEnvironment;
    /** Leaves out the shortcuts ⌘\ / Ctrl+\ and ⌘J / Ctrl+J, e.g. when the app handles them itself. */
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
        assistant,
        assistantOpen = false,
        onAssistantOpenChange,
        environment,
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
    const hasAssistant = assistant != null;
    const ownerState: AppShellOwnerState = { layout, navCollapsed, assistantOpen: hasAssistant && assistantOpen, environment: environment != null };
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
    const assistantContentRef = useRef<HTMLDivElement>(null);
    const assistantSwitchRef = useRef<HTMLButtonElement>(null);
    // The assistant renders into one element that moves between the column and the narrow sheet, so its state, e.g. a conversation,
    // survives when the window crosses the breakpoint
    const [assistantHost] = useState(() => (typeof document === "undefined" ? null : document.createElement("div")));
    const attachAssistantHost = useCallback(
        (node: HTMLElement | null) => {
            // Moving the element blurs what has focus in it, so it only moves when its parent changes
            if (node != null && assistantHost != null && assistantHost.parentNode !== node) {
                assistantHost.className = styles.assistantHost;
                node.appendChild(assistantHost);
            }
        },
        [assistantHost],
    );
    const findAssistantFocusTarget = () => assistantHost?.querySelector<HTMLElement>("[data-autofocus], textarea, input") ?? null;

    const focusInAssistantRef = useRef(false);
    const changeAssistantOpen = (open: boolean) => onAssistantOpenChange?.(open);

    useLayoutEffect(() => {
        if (!assistantOpen && focusInAssistantRef.current) {
            focusInAssistantRef.current = false;
            assistantSwitchRef.current?.focus();
        }
    }, [assistantOpen]);

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

    useKeyboardShortcut("mod+j", () => changeAssistantOpen(!assistantOpen), { enabled: !disableKeyboardShortcuts && hasAssistant });

    useEffect(() => {
        if (!ownerState.assistantOpen || layout === "narrow") {
            return;
        }
        const timeout = window.setTimeout(() => {
            (findAssistantFocusTarget() ?? assistantContentRef.current)?.focus();
        }, assistantFocusDelay);
        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the focus target is looked up when the timeout fires
    }, [ownerState.assistantOpen, layout]);

    const onAssistantKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
        // On narrow windows, the sheet closes on Escape itself
        if (event.key === "Escape" && !event.defaultPrevented && layout !== "narrow") {
            event.preventDefault();
            changeAssistantOpen(false);
        }
    };

    const columnContext: AppShellContextValue = {
        navCollapsed: columnNavCollapsed,
        onNavCollapsedChange: layout === "narrow" ? undefined : changeColumnNavCollapsed,
        onNavigate: isMedium ? () => setNavOverlayOpen(false) : undefined,
        navCollapseKeyboardShortcut: navCollapseShortcutEnabled ? navCollapseKeyboardShortcut : undefined,
        environment,
    };
    const drawerContext: AppShellContextValue = { navCollapsed: false, onNavigate: () => setNavDrawerOpen(false), environment };
    const mainContext: AppShellContextValue = {
        navCollapsed: navCollapsed || isMedium,
        onNavDrawerOpen: layout === "narrow" ? () => setNavDrawerOpen(true) : undefined,
        layout,
        assistantOpen: hasAssistant ? assistantOpen : undefined,
        onAssistantOpenChange: hasAssistant ? changeAssistantOpen : undefined,
        assistantSwitchRef,
        environment,
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
            data-assistantopen={ownerState.assistantOpen ? "" : undefined}
            data-environment={ownerState.environment ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <span ref={anchorRef} hidden />
            {environment != null && <div className={styles.environmentEdge} data-color={environment.color ?? "warning"} aria-hidden />}
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
            {hasAssistant &&
                (layout === "narrow" ? (
                    <BaseDialog.Root open={assistantOpen} onOpenChange={(open) => changeAssistantOpen(open)}>
                        <BaseDialog.Portal container={container} keepMounted>
                            <BaseDialog.Backdrop className={styles.backdrop} />
                            <BaseDialog.Popup
                                aria-label={labels.assistant}
                                initialFocus={() => findAssistantFocusTarget() ?? true}
                                finalFocus={() => assistantSwitchRef.current ?? true}
                                className={styles.assistantSheet}
                            >
                                <div ref={attachAssistantHost} className={styles.assistantSheetBody} />
                            </BaseDialog.Popup>
                        </BaseDialog.Portal>
                    </BaseDialog.Root>
                ) : (
                    <div className={styles.assistant}>
                        <aside ref={attachAssistantHost} aria-label={labels.assistant} inert={!assistantOpen} className={styles.assistantPanel} />
                    </div>
                ))}
            {hasAssistant &&
                assistantHost != null &&
                createPortal(
                    <div
                        ref={assistantContentRef}
                        tabIndex={-1}
                        onKeyDown={onAssistantKeyDown}
                        onFocus={() => {
                            focusInAssistantRef.current = true;
                        }}
                        onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                                focusInAssistantRef.current = false;
                            }
                        }}
                        className={styles.assistantContent}
                    >
                        {assistant}
                    </div>,
                    assistantHost,
                )}
            <div className={styles.grain} aria-hidden />
        </div>
    );
});
