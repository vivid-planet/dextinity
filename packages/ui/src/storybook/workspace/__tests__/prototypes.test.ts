import { describe, expect, it } from "vitest";

import { humanizePageId } from "../prototypes";

describe("humanizePageId", () => {
    it("makes a label from the last part of a page's id", () => {
        expect(humanizePageId("warnings")).toBe("Warnings");
        expect(humanizePageId("news/old-news")).toBe("Old news");
        expect(humanizePageId("job_ads")).toBe("Job ads");
    });

    it("keeps an id without words", () => {
        expect(humanizePageId("--")).toBe("--");
    });
});
