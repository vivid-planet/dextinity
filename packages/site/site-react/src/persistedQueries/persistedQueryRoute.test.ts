// @vitest-environment node
import { mkdtemp, rm, writeFile } from "fs/promises";
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

    function createGetRequest(headers: Record<string, string> = {}) {
        const url = new URL("http://site.test/graphql");
        url.searchParams.set("extensions.persistedQuery.sha256Hash", hash);
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
});
