// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMemoryFetchCacheStore } from "./fetchCacheStore.js";
import { createServerGraphQLFetch } from "./graphQLFetch.js";
import { runWithRequestContext, setPreview, type Visibility } from "./requestContext.js";

const fetchMock = vi.fn<typeof fetch>();

function createTestGraphQLFetch() {
    return createServerGraphQLFetch({
        url: "https://api.example.com/graphql",
        headers: { authorization: "Basic secret" },
        cache: { revalidateInSeconds: 60, store: createMemoryFetchCacheStore() },
    });
}

function runWithVisibility<T>(visibility: Visibility, callback: () => T): T {
    return runWithRequestContext({ request: new Request("https://www.example.com/en"), isRscRequest: false }, () => {
        setPreview({ visibility });
        return callback();
    });
}

function getSentHeaders(call: number) {
    return new Headers(fetchMock.mock.calls[call][1]?.headers);
}

describe("createServerGraphQLFetch", () => {
    beforeEach(() => {
        fetchMock.mockImplementation(async () => Response.json({ data: { page: "content" } }));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllGlobals();
    });

    it("sends the query with the headers of the site and caches the response", async () => {
        const graphQLFetch = createTestGraphQLFetch();

        const first = await runWithVisibility("default", () => graphQLFetch("query Page { page }"));
        const second = await runWithVisibility("default", () => graphQLFetch("query Page { page }"));

        expect(first).toEqual({ page: "content" });
        expect(second).toEqual({ page: "content" });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(getSentHeaders(0).get("authorization")).toBe("Basic secret");
        expect(getSentHeaders(0).get("x-include-invisible-content")).toBeNull();
    });

    it.each<[Visibility, string]>([
        ["invisiblePages", "Pages:Unpublished"],
        ["invisibleBlocks", "Pages:Unpublished,Blocks:Invisible"],
    ])("sends the preview headers for the visibility %s and bypasses the cache", async (visibility, includeInvisibleContent) => {
        const graphQLFetch = createTestGraphQLFetch();

        await runWithVisibility(visibility, () => graphQLFetch("query Page { page }"));
        await runWithVisibility(visibility, () => graphQLFetch("query Page { page }"));

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(getSentHeaders(0).get("x-include-invisible-content")).toBe(includeInvisibleContent);
        expect(getSentHeaders(0).get("authorization")).toBe("Basic secret");
    });

    it("reads the visibility of the current request for each query", async () => {
        const graphQLFetch = createTestGraphQLFetch();

        await runWithVisibility("default", () => graphQLFetch("query Page { page }"));
        await runWithVisibility("invisiblePages", () => graphQLFetch("query Page { page }"));

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(getSentHeaders(0).get("x-include-invisible-content")).toBeNull();
        expect(getSentHeaders(1).get("x-include-invisible-content")).toBe("Pages:Unpublished");
    });
});
