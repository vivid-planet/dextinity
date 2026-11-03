import { describe, expect, it } from "vitest";

import { getFilesWithMimeTypeFromEvent } from "./fileUpload.utils";

function createChangeEventWithFile(file: File) {
    const input = document.createElement("input");
    input.type = "file";
    Object.defineProperty(input, "files", { value: [file] });
    const event = new Event("change");
    input.dispatchEvent(event);
    return event;
}

describe("getFilesWithMimeTypeFromEvent", () => {
    it.each([
        ["clip.mov", "video/quicktime"],
        ["captions.vtt", "text/vtt"],
        ["document.odt", "application/vnd.oasis.opendocument.text"],
        ["video.ogv", "video/ogg"],
        ["image.jpg", "image/jpeg"],
    ])("derives the MIME type of %s from its extension when the browser doesn't set one", async (filename, expectedMimeType) => {
        const files = await getFilesWithMimeTypeFromEvent(createChangeEventWithFile(new File(["content"], filename)));

        expect(files).toHaveLength(1);
        expect((files[0] as File).type).toBe(expectedMimeType);
    });

    it("keeps the MIME type set by the browser", async () => {
        const files = await getFilesWithMimeTypeFromEvent(createChangeEventWithFile(new File(["content"], "image.png", { type: "image/webp" })));

        expect((files[0] as File).type).toBe("image/webp");
    });
});
