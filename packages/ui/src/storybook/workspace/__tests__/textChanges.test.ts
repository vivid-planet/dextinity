import { describe, expect, it } from "vitest";

import { formatCodeRequest, getCodeRequestChanges } from "../textChanges";
import type { TextChange } from "../workspaceNotes";

function createChange(changes: Partial<TextChange> = {}): TextChange {
    return { id: "1", prototypeId: "career", page: "jobs", path: [0], original: "Apply", text: "Apply now", ...changes };
}

describe("getCodeRequestChanges", () => {
    it("takes only the changes whose toggle is on, leaving out changes stored before the toggle existed", () => {
        const changes = [
            createChange({ id: "stored-before" }),
            createChange({ id: "on", inCodeRequest: true }),
            createChange({ id: "off", inCodeRequest: false }),
        ];
        expect(getCodeRequestChanges(changes).map((change) => change.id)).toEqual(["on"]);
    });
});

describe("formatCodeRequest", () => {
    it("names the prototype, page, and element of each change", () => {
        const request = formatCodeRequest([createChange({ element: "button “Apply”" })], () => ({
            prototypeName: "Career portal",
            pageLabel: "Job ads",
        }));
        expect(request.split("\n")[1]).toBe("- Prototype `career`, page “Job ads” (`jobs`), button “Apply”: “Apply” → “Apply now”");
    });
});
