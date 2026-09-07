import { describe, expect, it } from "vitest";

import type { ContentScopeValues } from "../contentScope/Provider";
import { resolveDependencyScope } from "./resolveDependencyScope";

const availableScopes: ContentScopeValues = [{ scope: { domain: "main", language: "de" } }, { scope: { domain: "secondary", language: "en" } }];

describe("resolveDependencyScope", () => {
    it("should keep the active scope for an entry from that scope", () => {
        expect(
            resolveDependencyScope({
                scope: { domain: "secondary", language: "en" },
                activeScope: { domain: "secondary", language: "en" },
                availableScopes,
            }),
        ).toEqual({ domain: "secondary", language: "en" });
    });

    it("should merge an incomplete scope into the active scope", () => {
        expect(
            resolveDependencyScope({
                scope: { domain: "main" },
                activeScope: { domain: "main", language: "de" },
                availableScopes,
            }),
        ).toEqual({ domain: "main", language: "de" });
    });

    it("should use an available scope when the merged scope is not available", () => {
        expect(
            resolveDependencyScope({
                scope: { domain: "main" },
                activeScope: { domain: "secondary", language: "en" },
                availableScopes,
            }),
        ).toEqual({ domain: "main", language: "de" });
    });

    it("should return undefined when no available scope contains the entry's scope", () => {
        expect(
            resolveDependencyScope({
                scope: { domain: "third" },
                activeScope: { domain: "main", language: "de" },
                availableScopes,
            }),
        ).toBeUndefined();
    });

    it("should merge into the active scope when no scopes are available for comparison", () => {
        expect(
            resolveDependencyScope({
                scope: { domain: "main" },
                activeScope: { domain: "secondary", language: "en" },
                availableScopes: [],
            }),
        ).toEqual({ domain: "main", language: "en" });
    });
});
