import { convertPreviewDataToHeaders, createFetchWithDefaults, createGraphQLFetch, type GraphQLFetch, type PreviewData } from "@dextinity/site-react";

import { createCachingFetch } from "./fetchCache.js";
import type { FetchCacheStore } from "./fetchCacheStore.js";
import { isGraphQLQuery, isGraphQLQueryRequest } from "./graphQLQueryRequest.js";
import { getVisibility, type Visibility } from "./requestContext.js";
import { createRequestMemoizedFetch } from "./requestMemoizedFetch.js";

function getPreviewData(visibility: Visibility): PreviewData | undefined {
    if (visibility === "default") {
        return undefined;
    }
    return { includeInvisible: visibility === "invisibleBlocks" };
}

/**
 * Creates the GraphQL fetch for server components, one instance for the whole site.
 * Each query sends the preview headers of the current request, e.g. in the site preview, and bypasses the cache in a preview.
 * Mutations always bypass the cache.
 * Identical queries are sent only once per request of the site, also in a preview, see `createRequestMemoizedFetch`.
 * Mutations and queries with a `signal` aren't memoized.
 */
export function createServerGraphQLFetch({
    url,
    headers,
    cache,
}: {
    url: string;
    /** E.g. the authorization of the site at the API */
    headers?: Record<string, string>;
    cache: { revalidateInSeconds: number; store: FetchCacheStore };
}): GraphQLFetch {
    const memoizedCachingFetch = createRequestMemoizedFetch(createCachingFetch(fetch, cache), { isMemoizable: isGraphQLQueryRequest });
    const memoizedUncachedFetch = createRequestMemoizedFetch((input, init) => fetch(input, init), { isMemoizable: isGraphQLQueryRequest });

    return function <T, V>(query: string, variables?: V, init?: RequestInit): Promise<T> {
        const previewData = getPreviewData(getVisibility());
        // Preview content must always be up to date, and mutations must always be sent
        const baseFetch = previewData || !isGraphQLQuery(query) ? memoizedUncachedFetch : memoizedCachingFetch;
        const graphQLFetch = createGraphQLFetch(
            createFetchWithDefaults(baseFetch, { headers: { ...headers, ...convertPreviewDataToHeaders(previewData) } }),
            url,
        );
        return graphQLFetch<T, V>(query, variables, init);
    };
}
