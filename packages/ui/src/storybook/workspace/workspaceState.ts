import { useEffect, useState } from "react";

export type WorkspaceZoom = "fit" | "0.5" | "0.75" | "1" | "1.5";

export type WorkspaceMode = "components" | "prototypes";

export type WorkspaceCompare = "off" | "viewports" | "variants" | "swipe";

export interface WorkspaceState {
    /** The tab: a clickable prototype of a whole app, or a single story of the Storybook. */
    mode: WorkspaceMode;
    storyId: string | null;
    prototypeId: string | null;
    /** The page fills all the room below the toolbar and follows the window's width, instead of sitting on the canvas at `width` × `height`. */
    responsive: boolean;
    width: number;
    height: number;
    zoom: WorkspaceZoom;
    /** Shows the prototype in several frames side by side, at different sizes or with different settings. */
    compare: WorkspaceCompare;
    panelOpen: boolean;
    panelWidth: number;
}

const storageKey = "dextinity-ui-workspace";

export const defaultWorkspaceState: WorkspaceState = {
    mode: "prototypes",
    storyId: null,
    prototypeId: null,
    responsive: true,
    width: 1440,
    height: 900,
    zoom: "fit",
    compare: "off",
    panelOpen: true,
    panelWidth: 300,
};

function readStoredState(): WorkspaceState {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        return typeof stored === "object" && stored !== null ? { ...defaultWorkspaceState, ...stored } : defaultWorkspaceState;
    } catch {
        return defaultWorkspaceState;
    }
}

/**
 * The workspace's own settings — the tab, the shown story and prototype, frame size, zoom, and panel — kept across reloads.
 */
export function useWorkspaceState() {
    const [state, setState] = useState(readStoredState);

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch {
            // Without storage, the workspace starts from the defaults on the next load
        }
    }, [state]);

    function update(changes: Partial<WorkspaceState>) {
        setState((previous) => ({ ...previous, ...changes }));
    }

    return [state, update] as const;
}
