import { convertPreviewDataToHeaders, createFetchWithDefaults, createGraphQLFetch, type GraphQLFetch, type PreviewData } from "@dextinity/site-react";
import type { RouterContextProvider } from "react-router";

import { createCachingFetch } from "./fetchCache.js";
import type { FetchCacheStore } from "./fetchCacheStore.js";
import { getVisibility, type Visibility } from "./preview.js";

function getPreviewData(visibility: Visibility): PreviewData | undefined {
    if (visibility === "default") {
        return undefined;
    }
    return { includeInvisible: visibility === "invisibleBlocks" };
}

/**
 * Sends each query only once per request, e.g. when a loader checks that a page exists and its server component renders it
 */
function memoizeQueries(graphQLFetch: GraphQLFetch): GraphQLFetch {
    const results = new Map<string, Promise<unknown>>();
    return function <T, V>(query: string, variables?: V, init?: RequestInit): Promise<T> {
        if (/^\s*mutation\b/.test(query)) {
            return graphQLFetch<T, V>(query, variables, init);
        }
        const key = JSON.stringify([query, variables, init?.headers]);
        let result = results.get(key);
        if (!result) {
            result = graphQLFetch<T, V>(query, variables, init);
            results.set(key, result);
            // Failed queries are sent again, e.g. by the error page
            result.catch(() => results.delete(key));
        }
        return result as Promise<T>;
    };
}

/**
 * Creates the GraphQL fetch of the site, one instance for the whole site. It returns the GraphQL fetch of a request, which sends the
 * preview headers of the request, e.g. in the site preview, bypasses the cache in a preview and sends each query once per request.
 *
 * @example
 * export const getGraphQLFetch = createServerGraphQLFetch({ url, headers, cache });
 *
 * // In a loader
 * const data = await getGraphQLFetch(context)(query, variables);
 * // In a server component
 * const data = await getGraphQLFetch(getRequestContext())(query, variables);
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
}): (context: Readonly<RouterContextProvider>) => GraphQLFetch {
    const cachingFetch = createCachingFetch(fetch, cache);
    const cachedGraphQLFetch = createGraphQLFetch(createFetchWithDefaults(cachingFetch, { headers: { ...headers } }), url);
    const graphQLFetchesOfRequests = new WeakMap<Readonly<RouterContextProvider>, GraphQLFetch>();

    return function getGraphQLFetch(context) {
        let graphQLFetch = graphQLFetchesOfRequests.get(context);
        if (!graphQLFetch) {
            const previewData = getPreviewData(getVisibility(context));
            graphQLFetch = memoizeQueries(
                previewData
                    ? // Preview content must always be up to date
                      createGraphQLFetch(
                          createFetchWithDefaults(fetch, { headers: { ...headers, ...convertPreviewDataToHeaders(previewData) } }),
                          url,
                      )
                    : cachedGraphQLFetch,
            );
            graphQLFetchesOfRequests.set(context, graphQLFetch);
        }
        return graphQLFetch;
    };
}
