import { act, renderHook } from "test-utils";
import { describe, expect, it } from "vitest";

import { usePageSearch } from "./usePageSearch";

describe("usePageSearch", () => {
    it("doesn't loop when the tree changes identity on every render while a query without matches is set", () => {
        const { result } = renderHook(() =>
            usePageSearch({
                tree: new Map(),
                pagesToRender: [],
                siteUrl: "https://example.com",
                setExpandedIds: () => {},
                onUpdateCurrentMatch: () => {},
            }),
        );

        act(() => {
            result.current.setQuery("does not exist");
        });

        expect(result.current.totalMatches).toBe(0);
    });
});
