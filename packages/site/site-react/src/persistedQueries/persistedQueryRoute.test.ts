// @vitest-environment node
import { mkdtemp, rm, utimes, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { persistedQueryRoute } from "./persistedQueryRoute";

const hash = "abc123";
const graphqlTarget = "http://api.test/graphql";

describe("persistedQueryRoute", () => {
    let tempDir: string;
    let persistedQueriesPath: string;
    const fetchMock = vi.fn<typeof fetch>();

    beforeAll(async () => {
        tempDir = await mkdtemp(join(tmpdir(), "persisted-query-route-"));
        persistedQueriesPath = join(tempDir, "persisted-queries.json");
        await writeFile(persistedQueriesPath, JSON.stringify({ [hash]: "query Test { test }" }));
    });

    afterAll(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    beforeEach(() => {
        fetchMock.mockImplementation(async () => Response.json({ data: { test: true } }));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        fetchMock.mockReset();
    });

    function createGetRequest(headers: Record<string, string> = {}, queryHash = hash) {
        const url = new URL("http://site.test/graphql");
        url.searchParams.set("extensions.persistedQuery.sha256Hash", queryHash);
        return new Request(url, { method: "GET", headers: { "Apollo-Require-Preflight": "true", ...headers } });
    }

    function getUpstreamHeaders() {
        expect(fetchMock).toHaveBeenCalledTimes(1);
        return new Headers(fetchMock.mock.calls[0][1]?.headers);
    }

    it("does not forward preview headers from the incoming request", async () => {
        const response = await persistedQueryRoute(
            createGetRequest({
                "x-include-invisible-content": "Pages:Unpublished,Pages:Archived,Blocks:Invisible",
                "x-preview-dam-urls": "1",
            }),
            { graphqlTarget, persistedQueriesPath, cacheMaxAge: 450 },
        );

        const upstreamHeaders = getUpstreamHeaders();
        expect(upstreamHeaders.has("x-include-invisible-content")).toBe(false);
        expect(upstreamHeaders.has("x-preview-dam-urls")).toBe(false);
        expect(response.headers.get("Cache-Control")).toBe("public, max-age=450");
    });

    it("sets preview headers from previewData", async () => {
        await persistedQueryRoute(createGetRequest(), {
            graphqlTarget,
            persistedQueriesPath,
            cacheMaxAge: 450,
            previewData: { includeInvisible: true },
        });

        const upstreamHeaders = getUpstreamHeaders();
        expect(upstreamHeaders.get("x-include-invisible-content")).toBe("Pages:Unpublished,Blocks:Invisible");
        expect(upstreamHeaders.get("x-preview-dam-urls")).toBe("1");
    });

    it("does not let the incoming request widen the preview headers", async () => {
        await persistedQueryRoute(createGetRequest({ "x-include-invisible-content": "Pages:Unpublished,Pages:Archived,Blocks:Invisible" }), {
            graphqlTarget,
            persistedQueriesPath,
            cacheMaxAge: 450,
            previewData: { includeInvisible: false },
        });

        expect(getUpstreamHeaders().get("x-include-invisible-content")).toBe("Pages:Unpublished");
    });

    it("prevents caching of preview responses", async () => {
        const response = await persistedQueryRoute(createGetRequest(), {
            graphqlTarget,
            persistedQueriesPath,
            cacheMaxAge: 450,
            previewData: { includeInvisible: false },
        });

        expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    });

    describe("during development", () => {
        let reloadedQueriesPath: string;
        let modifiedAt = 0;

        beforeAll(() => {
            reloadedQueriesPath = join(tempDir, "reloaded-queries.json");
        });

        async function writePersistedQueries(content: string) {
            await writeFile(reloadedQueriesPath, content);
            modifiedAt += 1000;
            await utimes(reloadedQueriesPath, modifiedAt / 1000, modifiedAt / 1000);
        }

        async function requestQuery(queryHash = hash) {
            fetchMock.mockClear();
            return persistedQueryRoute(createGetRequest({}, queryHash), {
                graphqlTarget,
                persistedQueriesPath: reloadedQueriesPath,
                cacheMaxAge: undefined,
            });
        }

        function getUpstreamQuery() {
            expect(fetchMock).toHaveBeenCalledTimes(1);
            return JSON.parse(fetchMock.mock.calls[0][1]?.body as string).query as string;
        }

        it("finds a query added after the first request", async () => {
            await writePersistedQueries(JSON.stringify({ [hash]: "query Test { test }" }));
            await requestQuery();

            await writePersistedQueries(JSON.stringify({ [hash]: "query Test { test }", def456: "query Added { added }" }));
            const response = await requestQuery("def456");

            expect(response.status).toBe(200);
            expect(getUpstreamQuery()).toBe("query Added { added }");
        });

        it("uses a changed fragment", async () => {
            await writePersistedQueries(
                JSON.stringify({ [hash]: "query Test { ...TestFragment }", fragment: "fragment TestFragment on Test { a }" }),
            );
            await requestQuery();
            expect(getUpstreamQuery()).toContain("fragment TestFragment on Test { a }");

            await writePersistedQueries(
                JSON.stringify({ [hash]: "query Test { ...TestFragment }", fragment: "fragment TestFragment on Test { a b }" }),
            );
            await requestQuery();

            expect(getUpstreamQuery()).toContain("fragment TestFragment on Test { a b }");
        });

        it("keeps the previous queries when the file is half-written", async () => {
            await writePersistedQueries(JSON.stringify({ [hash]: "query Test { test }" }));
            await requestQuery();

            await writePersistedQueries(`{"${hash}": "query Te`);
            const response = await requestQuery();

            expect(response.status).toBe(200);
            expect(getUpstreamQuery()).toBe("query Test { test }");

            await writePersistedQueries(JSON.stringify({ [hash]: "query Test { test changed }" }));
            await requestQuery();

            expect(getUpstreamQuery()).toBe("query Test { test changed }");
        });
    });
});
