// @vitest-environment node
import { RouterContextProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMemoryFetchCacheStore } from "./fetchCacheStore.js";
import { createServerGraphQLFetch } from "./graphQLFetch.js";
import { previewContext, type Visibility } from "./preview.js";

const fetchMock = vi.fn<typeof fetch>();

function createTestGraphQLFetch() {
    return createServerGraphQLFetch({
        url: "https://api.example.com/graphql",
        headers: { authorization: "Basic secret" },
        cache: { revalidateInSeconds: 60, store: createMemoryFetchCacheStore() },
    });
}

function createContext(visibility: Visibility) {
    const context = new RouterContextProvider();
    context.set(previewContext, { visibility });
    return context;
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
        const getGraphQLFetch = createTestGraphQLFetch();

        const first = await getGraphQLFetch(createContext("default"))("query Page { page }");
        const second = await getGraphQLFetch(new RouterContextProvider())("query Page { page }");

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
        const getGraphQLFetch = createTestGraphQLFetch();

        await getGraphQLFetch(createContext(visibility))("query Page { page }");
        await getGraphQLFetch(createContext(visibility))("query Page { page }");

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(getSentHeaders(0).get("x-include-invisible-content")).toBe(includeInvisibleContent);
        expect(getSentHeaders(0).get("authorization")).toBe("Basic secret");
    });

    it("sends each query once per request", async () => {
        const getGraphQLFetch = createTestGraphQLFetch();
        const context = createContext("invisiblePages");

        await getGraphQLFetch(context)("query Page { page }", { id: "1" });
        await getGraphQLFetch(context)("query Page { page }", { id: "1" });
        await getGraphQLFetch(context)("query Page { page }", { id: "2" });
        await getGraphQLFetch(createContext("invisiblePages"))("query Page { page }", { id: "1" });

        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("sends failed queries again", async () => {
        const getGraphQLFetch = createTestGraphQLFetch();
        const context = createContext("invisiblePages");
        fetchMock.mockImplementationOnce(async () => new Response("Bad Gateway", { status: 502 }));

        await expect(getGraphQLFetch(context)("query Page { page }")).rejects.toThrow();
        expect(await getGraphQLFetch(context)("query Page { page }")).toEqual({ page: "content" });
    });
});
