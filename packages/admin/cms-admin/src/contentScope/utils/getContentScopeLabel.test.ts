import { describe, expect, it } from "vitest";

import type { ContentScopeValues } from "../Provider";
import { getContentScopeLabel } from "./getContentScopeLabel";

const values: ContentScopeValues = [
    { scope: { domain: "main", language: "de" }, label: { domain: "Main Domain", language: "DE" } },
    { scope: { domain: "secondary", language: "en" }, label: { language: "EN" } },
];

describe("getContentScopeLabel", () => {
    it("should use the labels of the content scope values", () => {
        expect(getContentScopeLabel({ scope: { domain: "main", language: "de" }, values })).toBe("Main Domain / DE");
    });

    it("should fall back to the capitalized value when no label exists", () => {
        expect(getContentScopeLabel({ scope: { domain: "secondary", language: "en" }, values })).toBe("Secondary / EN");
    });

    it("should support incomplete scopes", () => {
        expect(getContentScopeLabel({ scope: { domain: "main" }, values })).toBe("Main Domain");
    });

    it("should omit dimensions without a value", () => {
        expect(getContentScopeLabel({ scope: { domain: "main", language: null }, values })).toBe("Main Domain");
    });
});
