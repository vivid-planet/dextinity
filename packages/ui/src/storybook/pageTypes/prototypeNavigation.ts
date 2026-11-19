import { createContext, useContext } from "react";

export interface PrototypeNavigation {
    /** Opens the page of a navigation entry, e.g. `job-ads`. */
    navigate: (id: string) => void;
    /** The navigation shows only icons; kept across pages, as in the app. */
    navCollapsed: boolean;
    onNavCollapsedChange: (collapsed: boolean) => void;
}

/**
 * Set by a prototype around the page types it shows, so that the navigation of `PageTypeShell` opens other pages instead of only
 * marking its entry.
 */
export const PrototypeNavigationContext = createContext<PrototypeNavigation | null>(null);

export function usePrototypeNavigation() {
    return useContext(PrototypeNavigationContext);
}
