import { describe, expect, it } from "vitest";

import type { ContentScopeValues } from "../Provider";
import { defaultCreatePath } from "./defaultCreatePath";

describe("defaultCreatePath", () => {
    it("should create paths from content scope values", () => {
        const values: ContentScopeValues = [
            { scope: { domain: "main", language: "de" }, label: { language: "DE" } },
            { scope: { domain: "main", language: "en" }, label: { language: "EN" } },
            { scope: { domain: "secondary", language: "en" }, label: { language: "EN" } },
            { scope: { domain: "secondary", language: "de" }, label: { language: "DE" } },
            { scope: { country: "secondary" } },
        ];
        const result = defaultCreatePath(values);

        expect(result).toEqual(["/:domain(main|secondary)/:language(de|en)", "/:country(secondary)"]);
    });

    it("should handle empty values", () => {
        const values: ContentScopeValues = [];

        const result = defaultCreatePath(values);

        expect(result).toEqual([]);
    });

    it("should handle single value", () => {
        const values: ContentScopeValues = [{ scope: { domain: "main" } }];

        const result = defaultCreatePath(values);

        expect(result).toEqual(["/:domain(main)"]);
    });

    it("should handle multiple dimensions", () => {
        const values: ContentScopeValues = [{ scope: { domain: "main", language: "de", country: "DE" } }];

        const result = defaultCreatePath(values);

        expect(result).toEqual(["/:domain(main)/:language(de)/:country(DE)"]);
    });
});
