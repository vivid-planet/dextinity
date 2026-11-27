import { createContext, useContext } from "react";

import type { SideNavGroup } from "../../components/sideNav/SideNav";

/** How the user got from one page to another: a link or control on the page, or the app's navigation. */
export type FlowEdgeKind = "link" | "navigation";

/** Asks before the prototype leaves a page, e.g. with unsaved changes; `leave` goes on to the page the user chose. */
export type LeaveGuard = (leave: () => void) => void;

export interface PrototypeNavigation {
    /** Opens a page, e.g. `job-ads`; `via` tells a click in the app's navigation from a link on the page, for the flow map. */
    navigate: (id: string, via?: FlowEdgeKind) => void;
    /** The navigation shows only icons; kept across pages, as in the app. */
    navCollapsed: boolean;
    onNavCollapsedChange: (collapsed: boolean) => void;
    /** The AI assistant is open; kept across pages, as in the app. */
    assistantOpen?: boolean;
    onAssistantOpenChange?: (open: boolean) => void;
    /** The prototype's own navigation; without it, `PageTypeShell` shows the career portal's. */
    navGroups?: SideNavGroup[];
    /** Sets the guard asked before leaving the current page, `null` to leave freely. Ends with the page. */
    setLeaveGuard?: (guard: LeaveGuard | null) => void;
}

/**
 * Set by a prototype around the page types it shows, so that the navigation of `PageTypeShell` opens other pages instead of only
 * marking its entry.
 */
export const PrototypeNavigationContext = createContext<PrototypeNavigation | null>(null);

export function usePrototypeNavigation() {
    return useContext(PrototypeNavigationContext);
}
