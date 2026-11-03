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

        expect(result).toEqual([
            [
                { dimension: "domain", values: ["main", "secondary"] },
                { dimension: "language", values: ["de", "en"] },
            ],
            [{ dimension: "country", values: ["secondary"] }],
        ]);
    });

    it("should handle empty values", () => {
        const values: ContentScopeValues = [];

        const result = defaultCreatePath(values);

        expect(result).toEqual([]);
    });

    it("should handle single value", () => {
        const values: ContentScopeValues = [{ scope: { domain: "main" } }];

        const result = defaultCreatePath(values);

        expect(result).toEqual([[{ dimension: "domain", values: ["main"] }]]);
    });

    it("should handle multiple dimensions", () => {
        const values: ContentScopeValues = [{ scope: { domain: "main", language: "de", country: "DE" } }];

        const result = defaultCreatePath(values);

        expect(result).toEqual([
            [
                { dimension: "domain", values: ["main"] },
                { dimension: "language", values: ["de"] },
                { dimension: "country", values: ["DE"] },
            ],
        ]);
    });

    it("should allow null values as they are written in the URL", () => {
        const values: ContentScopeValues = [{ scope: { domain: "main", language: "de" } }, { scope: { domain: "main", language: null } }];

        const result = defaultCreatePath(values);

        expect(result).toEqual([
            [
                { dimension: "domain", values: ["main"] },
                { dimension: "language", values: ["de", "-"] },
            ],
        ]);
    });

    it("should handle scopes without dimensions", () => {
        const values: ContentScopeValues = [{ scope: {} }];

        const result = defaultCreatePath(values);

        expect(result).toEqual([[]]);
    });
});
