// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { persistedQueriesPlugin } from "./persistedQueriesPlugin.js";

type Mode = "dev" | "build";
type HookContext = { environment: { mode: Mode } };
type TransformHook = (this: HookContext, source: string, id: string) => { code: string } | null;
type LifecycleHook = (this: HookContext) => void;

const query = "\n    query Page { page { ...PageContent } }\n    ${pageContentFragment}\n";
const fragment = "\n    fragment PageContent on Page { id }\n";

function hash(document: string) {
    return createHash("sha256").update(document).digest("hex");
}

describe("persistedQueriesPlugin", () => {
    let directory: string;
    let persistedQueriesPath: string;
    let sourceFile: string;

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), "persisted-queries-"));
        persistedQueriesPath = join(directory, "dist/persisted-queries.json");
        sourceFile = join(directory, "src/Page.tsx");
    });

    afterEach(() => {
        rmSync(directory, { recursive: true, force: true });
    });

    function createPlugin(mode: Mode) {
        const plugin = persistedQueriesPlugin({ persistedQueriesPath, include: join(directory, "src") });
        const context: HookContext = { environment: { mode } };
        return {
            buildStart: () => (plugin.buildStart as LifecycleHook).call(context),
            transform: (source: string, id = sourceFile) => (plugin.transform as TransformHook).call(context, source, id),
            buildEnd: () => (plugin.buildEnd as LifecycleHook).call(context),
        };
    }

    function writePersistedQueries(persistedQueries: Record<string, string>) {
        mkdirSync(dirname(persistedQueriesPath), { recursive: true });
        writeFileSync(persistedQueriesPath, JSON.stringify(persistedQueries));
    }

    function readPersistedQueries() {
        return JSON.parse(readFileSync(persistedQueriesPath, "utf-8")) as Record<string, string>;
    }

    it("replaces queries with their hash and fragments with a placeholder", () => {
        const plugin = createPlugin("dev");
        plugin.buildStart();

        const result = plugin.transform(`const pageQuery = gql\`${query}\`;\nconst pageContentFragment = gql\`${fragment}\`;`);

        expect(result?.code).toContain(`const pageQuery = { hash: "${hash(query)}", fragmentVariables: \`\${pageContentFragment}\` };`);
        expect(result?.code).toContain("const pageContentFragment = { fragment: true, fragmentVariables: `` };");
        expect(result?.code).not.toContain("gql`");
    });

    it("writes the documents on each transform during development, keeping the ones of earlier runs", () => {
        writePersistedQueries({ earlier: "query Earlier { page }" });
        const plugin = createPlugin("dev");
        plugin.buildStart();

        plugin.transform(`gql\`${query}\``);

        expect(readPersistedQueries()).toEqual({ earlier: "query Earlier { page }", [hash(query)]: query });
    });

    it("replaces earlier versions of a changed fragment during development", () => {
        const earlierFragment = "\n    fragment PageContent on Page { id title }\n";
        writePersistedQueries({ [hash(earlierFragment)]: earlierFragment, [hash(query)]: query });
        const plugin = createPlugin("dev");
        plugin.buildStart();

        plugin.transform(`const pageContentFragment = gql\`${fragment}\`;`);

        expect(readPersistedQueries()).toEqual({ [hash(query)]: query, [hash(fragment)]: fragment });
    });

    it("writes only the documents of the build at its end", () => {
        writePersistedQueries({ stale: "query Stale { page }" });
        const plugin = createPlugin("build");
        plugin.buildStart();

        plugin.transform(`gql\`${query}\``);
        expect(readPersistedQueries()).toEqual({ stale: "query Stale { page }" });
        plugin.buildEnd();

        expect(readPersistedQueries()).toEqual({ [hash(query)]: query });
    });

    it("ignores files outside of include, other file types and files without GraphQL documents", () => {
        const plugin = createPlugin("dev");
        plugin.buildStart();

        expect(plugin.transform(`gql\`${query}\``, join(directory, "node_modules/library/index.js"))).toBeNull();
        expect(plugin.transform(`gql\`${query}\``, join(directory, "src/styles.css"))).toBeNull();
        expect(plugin.transform("const value = 1;")).toBeNull();
    });
});
