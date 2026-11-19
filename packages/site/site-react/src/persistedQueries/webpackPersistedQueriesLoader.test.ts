// @vitest-environment node
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { LoaderContext } from "webpack";

import webpackPersistedQueriesLoader from "./webpackPersistedQueriesLoader";

describe("webpackPersistedQueriesLoader", () => {
    let tempDir: string;
    let persistedQueriesPath: string;

    beforeEach(async () => {
        tempDir = await mkdtemp(join(tmpdir(), "persisted-queries-loader-"));
        persistedQueriesPath = join(tempDir, "persisted-queries.json");
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    function transform(source: string) {
        const context = { getOptions: () => ({ persistedQueriesPath }) } as LoaderContext<{ persistedQueriesPath: string }>;
        return webpackPersistedQueriesLoader.call(context, source);
    }

    async function readPersistedQueries() {
        return Object.values(JSON.parse(await readFile(persistedQueriesPath, "utf-8")) as Record<string, string>);
    }

    it("keeps only the latest version of a fragment after an undo", async () => {
        transform("const fragment = gql`fragment TestFragment on Test { a }`;");
        transform("const fragment = gql`fragment TestFragment on Test { a b }`;");
        transform("const fragment = gql`fragment TestFragment on Test { a }`;");

        expect(await readPersistedQueries()).toEqual(["fragment TestFragment on Test { a }"]);
    });

    it("keeps previous versions of queries", async () => {
        transform("const query = gql`query Test { a }`;");
        transform("const query = gql`query Test { a b }`;");

        expect(await readPersistedQueries()).toEqual(["query Test { a }", "query Test { a b }"]);
    });
});
