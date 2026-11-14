import { createContext, useContext } from "react";

/**
 * What the `AppShell` tells the shell parts placed in it, so they follow the window width and the shell's state without extra props.
 */
export interface AppShellContextValue {
    /** The navigation shows only icons. */
    navCollapsed: boolean;
    /** Collapses or expands the navigation; unset where it can't be toggled, e.g. in the drawer. */
    onNavCollapsedChange?: (collapsed: boolean) => void;
    /** Opens the navigation as a drawer; set only on narrow windows, where the navigation is hidden. */
    onNavDrawerOpen?: () => void;
    /** Called after a navigation entry was chosen, e.g. to close the drawer. */
    onNavigate?: () => void;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShellContext() {
    return useContext(AppShellContext);
}
