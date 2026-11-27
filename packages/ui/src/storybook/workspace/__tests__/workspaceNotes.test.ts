import { describe, expect, it } from "vitest";

import { getCodeRequestChanges } from "../textChanges";
import { designerNoteList, isNoteDone, textChangeList } from "../workspaceNotes";

function storeRaw(storageKey: string, items: unknown[]) {
    localStorage.setItem(storageKey, JSON.stringify(items));
    // The lists read the storage again once another window changed it
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
}

describe("stored lists", () => {
    it("reads the comments stored before they became designer notes", () => {
        storeRaw("dextinity-ui-workspace-comments", [
            { id: "c1", prototypeId: "career", page: "jobs", path: [0, 2], x: 0.5, y: 0.5, text: "Too long", resolved: true },
        ]);
        const [note] = designerNoteList.get();
        expect(note.text).toBe("Too long");
        expect(isNoteDone(note)).toBe(true);
        expect(note.createdAt).toBeUndefined();
    });

    it("leaves text changes stored before the code request toggle out of the code request", () => {
        storeRaw("dextinity-ui-workspace-text-changes", [{ id: "t1", prototypeId: "career", page: "jobs", path: [0], original: "A", text: "B" }]);
        expect(textChangeList.get()).toHaveLength(1);
        expect(getCodeRequestChanges(textChangeList.get())).toEqual([]);
    });
});
