import { createStoredList, type NoteAnchor } from "./workspaceNotes";

/** An element of a prototype's page that opens another page, set by the designer instead of in code. */
export interface Hotspot extends NoteAnchor {
    id: string;
    target: string;
}

export const hotspotList = createStoredList<Hotspot>("dextinity-ui-workspace-hotspots");

/** Set on the frame's root while a workspace tool uses the page's clicks, so that hotspots don't open pages then. */
export const toolAttribute = "data-workspace-tool";
