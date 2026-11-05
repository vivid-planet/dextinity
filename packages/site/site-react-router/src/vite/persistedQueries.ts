import { createHash } from "node:crypto";

export type PersistedQueries = Record<string, string>;

const gqlTagRegex = /gql`([\s\S]*?)`/gm;

function getFragmentName(query: string): string | undefined {
    return query.match(/^\s*fragment\s+(\w+)\s+on\s+\w+/)?.[1];
}

/**
 * Replaces the gql`` documents of the source with their hash and adds them to the persisted queries, like the
 * `webpackPersistedQueriesLoader` of `@dextinity/site-react` does
 */
export function transformPersistedQueries(source: string, persistedQueries: PersistedQueries): string | undefined {
    let hasReplacements = false;
    const transformedSource = source.replace(gqlTagRegex, (_match, query: string) => {
        hasReplacements = true;
        const hash = createHash("sha256").update(query).digest("hex");
        const fragmentName = getFragmentName(query);
        if (fragmentName) {
            // persistedQueryRoute resolves fragments by name, so a previous version must not shadow this one
            for (const [existingHash, existingQuery] of Object.entries(persistedQueries)) {
                if (existingHash !== hash && getFragmentName(existingQuery) === fragmentName) {
                    delete persistedQueries[existingHash];
                }
            }
        }
        persistedQueries[hash] = query;
        const fragmentVariables = Array.from(query.matchAll(/\${.*?}/g), (match) => match[0]).join(" ");
        return fragmentName
            ? `{ fragment: true, fragmentVariables: \`${fragmentVariables}\` }`
            : `{ hash: "${hash}", fragmentVariables: \`${fragmentVariables}\` }`;
    });
    return hasReplacements ? transformedSource : undefined;
}
