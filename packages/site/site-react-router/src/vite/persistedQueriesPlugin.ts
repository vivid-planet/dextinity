import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import type { Plugin } from "vite";

import { type PersistedQueries, transformPersistedQueries } from "./persistedQueries";

/**
 * Replaces the GraphQL documents of the client code with their hash and writes the documents to `persistedQueriesPath`, from where
 * `persistedQueryRoute()` of the BFF route reads them. The counterpart of the `webpackPersistedQueriesLoader` of `@dextinity/site-nextjs`.
 *
 * Only the client environment is transformed: server components and the server-side rendering send the documents to the API directly.
 *
 * @param options.persistedQueriesPath Where the persisted queries are written, e.g. `build/persisted-queries.json`
 * @param options.include The directory of the source files with GraphQL documents, e.g. the `src` directory of the site
 */
export function persistedQueriesPlugin({ persistedQueriesPath, include }: { persistedQueriesPath: string; include: string }): Plugin {
    const includedDirectory = resolve(include);
    let outputPath: string;
    let isBuild = false;
    let persistedQueries: PersistedQueries = {};

    function writePersistedQueries() {
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, JSON.stringify(persistedQueries, null, 2));
    }

    return {
        name: "dextinity:persisted-queries",
        applyToEnvironment(environment) {
            return environment.name === "client";
        },
        configResolved(config) {
            outputPath = resolve(config.root, persistedQueriesPath);
            isBuild = config.command === "build";
        },
        buildStart() {
            // A build writes the queries of its sources only, the development server keeps the ones of the files it hasn't transformed yet
            persistedQueries = !isBuild && existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, "utf-8")) : {};
        },
        transform(code, id) {
            const [path] = id.split("?");
            if (!path.startsWith(includedDirectory) || !/\.[cm]?[jt]sx?$/.test(path) || !code.includes("gql`")) {
                return undefined;
            }
            const transformedCode = transformPersistedQueries(code, persistedQueries);
            if (transformedCode === undefined) {
                return undefined;
            }
            if (!isBuild) {
                writePersistedQueries();
            }
            return { code: transformedCode, map: null };
        },
        buildEnd() {
            if (isBuild) {
                writePersistedQueries();
            }
        },
    };
}
