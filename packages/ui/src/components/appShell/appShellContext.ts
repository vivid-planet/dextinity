import { createContext, type RefObject, useContext } from "react";

/**
 * What the `AppShell` tells the shell parts placed in it, so they follow the window width and the shell's state without extra props.
 */
export interface AppShellContextValue {
    /** The navigation shows only icons. */
    navCollapsed: boolean;
    /** Collapses or expands the navigation; unset where it can't be toggled, e.g. in the drawer. */
    onNavCollapsedChange?: (collapsed: boolean) => void;
    /** The shortcut that collapses and expands the navigation, for its tooltip; unset while the shell doesn't listen to it. */
    navCollapseKeyboardShortcut?: string;
    /** Opens the navigation as a drawer; set only on narrow windows, where the navigation is hidden. */
    onNavDrawerOpen?: () => void;
    /** Called after a navigation entry was chosen, e.g. to close the drawer. */
    onNavigate?: () => void;
    /** Follows the window width: `wide` from 1280px, `medium` from 768px, `narrow` below. */
    layout?: "wide" | "medium" | "narrow";
    /** Whether the assistant is shown; unset when the shell has no assistant. */
    assistantOpen?: boolean;
    /** Shows or hides the assistant; unset when the shell has no assistant. */
    onAssistantOpenChange?: (open: boolean) => void;
    /** The shortcut that shows or hides the assistant; unset when the shell doesn't listen to it. */
    assistantKeyboardShortcut?: string;
    /** The switch that shows the assistant, so the shell can return focus to it when the assistant closes. */
    assistantSwitchRef?: RefObject<HTMLButtonElement | null>;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShellContext() {
    return useContext(AppShellContext);
}
