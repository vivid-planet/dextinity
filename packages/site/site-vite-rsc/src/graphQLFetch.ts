import { convertPreviewDataToHeaders, createFetchWithDefaults, createGraphQLFetch, type GraphQLFetch, type PreviewData } from "@dextinity/site-react";

import { createCachingFetch } from "./fetchCache.js";
import type { FetchCacheStore } from "./fetchCacheStore.js";
import { getVisibility, type Visibility } from "./requestContext.js";

function getPreviewData(visibility: Visibility): PreviewData | undefined {
    if (visibility === "default") {
        return undefined;
    }
    return { includeInvisible: visibility === "invisibleBlocks" };
}

/**
 * Creates the GraphQL fetch for server components, one instance for the whole site.
 * Each query sends the preview headers of the current request, e.g. in the site preview, and bypasses the cache in a preview.
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
    const cachingFetch = createCachingFetch(fetch, cache);

    return function <T, V>(query: string, variables?: V, init?: RequestInit): Promise<T> {
        const previewData = getPreviewData(getVisibility());
        // Preview content must always be up to date
        const baseFetch = previewData ? fetch : cachingFetch;
        const graphQLFetch = createGraphQLFetch(
            createFetchWithDefaults(baseFetch, { headers: { ...headers, ...convertPreviewDataToHeaders(previewData) } }),
            url,
        );
        return graphQLFetch<T, V>(query, variables, init);
    };
}
