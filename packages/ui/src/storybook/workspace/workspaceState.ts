import { useEffect, useState } from "react";

export type WorkspaceZoom = "fit" | "0.5" | "0.75" | "1" | "1.5";

export interface WorkspaceState {
    storyId: string | null;
    width: number;
    height: number;
    zoom: WorkspaceZoom;
    panelOpen: boolean;
}

const storageKey = "dextinity-ui-workspace";

export const defaultWorkspaceState: WorkspaceState = {
    storyId: null,
    width: 1440,
    height: 900,
    zoom: "fit",
    panelOpen: true,
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
