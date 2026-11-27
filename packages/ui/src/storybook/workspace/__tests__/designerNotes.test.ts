import { describe, expect, it } from "vitest";

import {
    describeNoteElement,
    filterNotes,
    formatNoteComment,
    formatNotesMarkdown,
    getFrameNoteEditResult,
    groupByPage,
    maxCommentBytes,
    maxCommentLabelBytes,
    truncateToBytes,
} from "../designerNotes";
import type { DesignerNote } from "../workspaceNotes";

const place = { prototypeName: "Career portal", pageLabel: "Job ads" };

function createNote(changes: Partial<DesignerNote> = {}): DesignerNote {
    return { id: "1", prototypeId: "career", page: "jobs", path: [0, 1], x: 0, y: 0, text: "Make the title shorter", ...changes };
}

function byteLength(text: string) {
    return new TextEncoder().encode(text).length;
}

describe("describeNoteElement", () => {
    it("names an element by its role and its text", () => {
        document.body.innerHTML = `<button>  Save\n changes </button><h2>Job ads</h2><img alt="Logo" /><div role="tab">Details</div>`;
        const [button, heading, image, tab] = Array.from(document.body.children);
        expect(describeNoteElement(button)).toBe("button “Save changes”");
        expect(describeNoteElement(heading)).toBe("heading 2 “Job ads”");
        expect(describeNoteElement(image)).toBe("image “Logo”");
        expect(describeNoteElement(tab)).toBe("tab “Details”");
    });

    it("shortens a long text", () => {
        const paragraph = document.createElement("p");
        paragraph.textContent = "word ".repeat(30);
        expect(describeNoteElement(paragraph)).toMatch(/^paragraph “.{39}…”$/);
    });
});

describe("formatNoteComment", () => {
    it("includes everything a reader needs without the Workbench", () => {
        const { text, label } = formatNoteComment(
            createNote({
                element: "heading 1 “Job ads”",
                view: {
                    brand: "dextinity",
                    colorScheme: "dark",
                    density: "compact",
                    textLength: "longer",
                    content: "many",
                    viewportWidth: 390,
                    viewportHeight: 844,
                },
            }),
            place,
        );
        expect(label).toBe("Note · Job ads");
        expect(text).toContain("Make the title shorter");
        expect(text).toContain("Prototype: Career portal (`career`)");
        expect(text).toContain("Page: Job ads (`jobs`)");
        expect(text).toContain("Element: heading 1 “Job ads”");
        expect(text).toContain("View: 390 × 844 · dextinity · dark · compact density · longer text length · many content");
        expect(text).toContain("Status: open");
    });

    it("keeps the comment and its label within the host's limits, cutting the note's text", () => {
        const { text, label } = formatNoteComment(createNote({ text: "ä".repeat(5000) }), { ...place, pageLabel: "Ü".repeat(200) });
        expect(byteLength(text)).toBeLessThanOrEqual(maxCommentBytes);
        expect(byteLength(label)).toBeLessThanOrEqual(maxCommentLabelBytes);
        expect(text).toContain("Status: open");
        expect(text).toContain("…");
    });
});

describe("truncateToBytes", () => {
    it("cuts between characters", () => {
        expect(truncateToBytes("😀😀😀", 9)).toBe("😀…");
        expect(truncateToBytes("short", 10)).toBe("short");
    });
});

describe("groupByPage", () => {
    it("puts the current page first and keeps the order of the others", () => {
        const notes = [
            createNote({ id: "a", page: "home" }),
            createNote({ id: "b", page: "jobs" }),
            createNote({ id: "c", page: "home" }),
            createNote({ id: "d", prototypeId: "cms", page: "jobs" }),
        ];
        const groups = groupByPage(notes, { prototypeId: "career", page: "jobs" });
        expect(groups.map((group) => [group.prototypeId, group.page, group.items.map((note) => note.id)])).toEqual([
            ["career", "jobs", ["b"]],
            ["career", "home", ["a", "c"]],
            ["cms", "jobs", ["d"]],
        ]);
    });
});

describe("filterNotes", () => {
    const notes = [createNote({ id: "open" }), createNote({ id: "done", resolved: true }), createNote({ id: "elsewhere", page: "home" })];
    const current = { prototypeId: "career", page: "jobs" };

    it("filters by page and status", () => {
        expect(filterNotes(notes, { scope: "page", status: "all" }, current).map((note) => note.id)).toEqual(["open", "done"]);
        expect(filterNotes(notes, { scope: "all", status: "open" }, current).map((note) => note.id)).toEqual(["open", "elsewhere"]);
        expect(filterNotes(notes, { scope: "all", status: "done" }, current).map((note) => note.id)).toEqual(["done"]);
    });
});

describe("formatNotesMarkdown", () => {
    it("lists the notes as a checklist by page", () => {
        const markdown = formatNotesMarkdown(
            [createNote({ id: "a", element: "button “Apply”" }), createNote({ id: "b", text: "Done one", resolved: true })],
            () => place,
            { prototypeId: "career", page: "jobs" },
        );
        expect(markdown).toBe(
            [
                "# Designer notes",
                "",
                "## Career portal · Job ads",
                "",
                "- [ ] Make the title shorter",
                "    - Element: button “Apply”",
                "- [x] Done one",
            ].join("\n"),
        );
    });
});

describe("getFrameNoteEditResult", () => {
    it("keeps a note whose text changed elsewhere since the editor opened", () => {
        expect(getFrameNoteEditResult({ storedText: "Edited in the sidebar", draft: "", original: "" })).toEqual({ action: "keep" });
        expect(getFrameNoteEditResult({ storedText: "Edited in the sidebar", draft: "Typed in the frame", original: "Old" })).toEqual({
            action: "keep",
        });
    });

    it("doesn't bring back a note deleted meanwhile", () => {
        expect(getFrameNoteEditResult({ storedText: undefined, draft: "Typed in the frame", original: "Old" })).toEqual({ action: "keep" });
    });

    it("deletes a note left empty", () => {
        expect(getFrameNoteEditResult({ storedText: "", draft: "", original: "" })).toEqual({ action: "delete" });
        expect(getFrameNoteEditResult({ storedText: "Old", draft: "  ", original: "Old" })).toEqual({ action: "delete" });
    });

    it("updates a changed text, trimmed", () => {
        expect(getFrameNoteEditResult({ storedText: "Old", draft: " New ", original: "Old" })).toEqual({ action: "update", text: "New" });
    });

    it("keeps an unchanged text", () => {
        expect(getFrameNoteEditResult({ storedText: "Old", draft: "Old ", original: "Old" })).toEqual({ action: "keep" });
    });
});
