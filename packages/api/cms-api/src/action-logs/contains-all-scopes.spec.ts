import { describe, expect, it } from "vitest";

import { containsAllScopes } from "./contains-all-scopes";

describe("containsAllScopes", () => {
    it("accepts equal scopes regardless of their order", () => {
        expect(containsAllScopes([{ domain: "secondary" }, { domain: "main" }], [{ domain: "main" }, { domain: "secondary" }])).toBe(true);
    });

    it("accepts more scopes than required", () => {
        expect(containsAllScopes([{ domain: "main" }, { domain: "secondary" }], [{ domain: "main" }])).toBe(true);
    });

    it("rejects scopes that lack one of the required scopes", () => {
        expect(containsAllScopes([{ domain: "main" }], [{ domain: "main" }, { domain: "secondary" }])).toBe(false);
    });

    it("rejects other scopes", () => {
        expect(containsAllScopes([{ domain: "secondary", language: "en" }], [{ domain: "main", language: "en" }])).toBe(false);
    });

    it("accepts no scopes only when none are required", () => {
        expect(containsAllScopes(undefined, null)).toBe(true);
        expect(containsAllScopes([{ domain: "main" }], undefined)).toBe(false);
        expect(containsAllScopes(null, [{ domain: "main" }])).toBe(false);
    });
});
