import { describe, expect, it } from "vitest";

import { getFrameStoryId } from "../frameElements";

describe("getFrameStoryId", () => {
    it("reads the story id from the frame's location", () => {
        const location = { search: "?id=prototypes-career-portal--default&viewMode=story" } as Location;
        expect(getFrameStoryId({ location })).toBe("prototypes-career-portal--default");
    });

    it("returns null for a document no longer shown", () => {
        expect(getFrameStoryId({ location: null } as unknown as Pick<Document, "location">)).toBeNull();
    });
});
