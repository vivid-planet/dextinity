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

    it("sends every mutation, bypassing the cache", async () => {
        const graphQLFetch = createTestGraphQLFetch();

        await runWithVisibility("default", () =>
            Promise.all([graphQLFetch("mutation Update { update }"), graphQLFetch("mutation Update { update }")]),
        );
        await runWithVisibility("default", () => graphQLFetch("mutation Update { update }"));

        expect(fetchMock).toHaveBeenCalledTimes(3);
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

describe("createServerGraphQLFetch request memoization", () => {
    beforeEach(() => {
        fetchMock.mockImplementation(async () => Response.json({ data: { page: "content" } }));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllGlobals();
    });

    it("sends identical queries only once per request in a preview, which bypasses the cache", async () => {
        const graphQLFetch = createTestGraphQLFetch();

        await runWithVisibility("invisibleBlocks", async () => {
            const [layout, page] = await Promise.all([graphQLFetch("query Page { page }"), graphQLFetch("query Page { page }")]);
            const metadata = await graphQLFetch("query Page { page }");
            expect([layout, page, metadata]).toEqual([{ page: "content" }, { page: "content" }, { page: "content" }]);
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("returns a separate result to each caller", async () => {
        const graphQLFetch = createTestGraphQLFetch();

        await runWithVisibility("invisibleBlocks", async () => {
            const first = await graphQLFetch<{ page: string }, undefined>("query Page { page }");
            first.page = "changed";
            expect(await graphQLFetch("query Page { page }")).toEqual({ page: "content" });
        });
    });

    it("sends queries with different variables separately", async () => {
        const graphQLFetch = createTestGraphQLFetch();

        await runWithVisibility("invisibleBlocks", async () => {
            await graphQLFetch("query Page($id: ID!) { page(id: $id) }", { id: "1" });
            await graphQLFetch("query Page($id: ID!) { page(id: $id) }", { id: "2" });
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("doesn't memoize mutations", async () => {
        const graphQLFetch = createTestGraphQLFetch();

        await runWithVisibility("invisibleBlocks", async () => {
            await graphQLFetch("mutation Subscribe { subscribe }");
            await graphQLFetch("mutation Subscribe { subscribe }");
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("doesn't share the queries of a preview with other requests", async () => {
        const graphQLFetch = createTestGraphQLFetch();

        await runWithVisibility("invisibleBlocks", () => graphQLFetch("query Page { page }"));
        await runWithVisibility("invisibleBlocks", () => graphQLFetch("query Page { page }"));

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
