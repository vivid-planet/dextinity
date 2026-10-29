import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import type { Plugin } from "vite";

// This regex matches gql`...` template literals, including multiline queries
const gqlTagRegex = /gql`([\s\S]*?)`/gm;

/**
 * Replaces GraphQL documents in the browser bundle with their hash and writes the documents to `persistedQueriesPath`.
 * The BFF route only executes these persisted queries.
 *
 * Vite version of `@dextinity/site-react/webpackPersistedQueriesLoader`.
 */
export function persistedQueriesPlugin({ persistedQueriesPath, include }: { persistedQueriesPath: string; include: string }): Plugin {
    let hashMap: Record<string, string> = {};

    function saveHashMap() {
        mkdirSync(dirname(persistedQueriesPath), { recursive: true });
        writeFileSync(persistedQueriesPath, JSON.stringify(hashMap, null, 2));
    }

    return {
        name: "@dextinity/site-vite-rsc:persisted-queries",
        applyToEnvironment: (environment) => environment.name === "client",
        buildStart() {
            if (this.environment.mode === "dev") {
                try {
                    hashMap = JSON.parse(readFileSync(persistedQueriesPath, "utf-8"));
                } catch {
                    hashMap = {};
                }
            } else {
                hashMap = {};
            }
        },
        transform(source, id) {
            if (!id.startsWith(include) || !/\.[jt]sx?$/.test(id) || !source.includes("gql`")) {
                return null;
            }

            const transformedSource = source.replace(gqlTagRegex, (_match, query: string) => {
                const hash = createHash("sha256").update(query).digest("hex");
                hashMap[hash] = query;
                const fragmentVariables = Array.from(query.matchAll(/\${.*?}/g))
                    .map((m) => m[0])
                    .join(" ");
                if (query.match(/^\s*fragment\s+(\w+)\s+on\s+\w+/)) {
                    return `{ fragment: true, fragmentVariables: \`${fragmentVariables}\` }`;
                }
                return `{ hash: "${hash}", fragmentVariables: \`${fragmentVariables}\` }`;
            });

            if (this.environment.mode === "dev") {
                saveHashMap();
            }

            return { code: transformedSource, map: null };
        },
        buildEnd() {
            if (this.environment.mode === "build") {
                saveHashMap();
            }
        },
    };
}
