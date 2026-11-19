import { useEffect, useState } from "react";

export type WorkspaceZoom = "fit" | "0.5" | "0.75" | "1" | "1.5";

export interface WorkspaceState {
    storyId: string | null;
    /** The page fills all the room below the toolbar and follows the window's width, instead of sitting on the canvas at `width` × `height`. */
    responsive: boolean;
    width: number;
    height: number;
    zoom: WorkspaceZoom;
    panelOpen: boolean;
    panelWidth: number;
    /** The expanded folders of the story tree; until the tree is first changed, the folders around the shown story. */
    expandedIds: string[] | null;
}

const storageKey = "dextinity-ui-workspace";

export const defaultWorkspaceState: WorkspaceState = {
    storyId: null,
    responsive: true,
    width: 1440,
    height: 900,
    zoom: "fit",
    panelOpen: true,
    panelWidth: 300,
    expandedIds: null,
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
 * The workspace's own settings — the shown story, frame size, zoom, and panel — kept across reloads.
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
