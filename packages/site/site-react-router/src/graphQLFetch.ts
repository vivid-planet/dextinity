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
 * Creates the GraphQL fetch for loaders, one instance for the whole site. It returns the GraphQL fetch of a request, which sends the
 * preview headers of the request, e.g. in the site preview, and bypasses the cache in a preview.
 *
 * @example
 * export const getGraphQLFetch = createServerGraphQLFetch({ url, headers, cache });
 *
 * export async function loader({ context }: Route.LoaderArgs) {
 *     const data = await getGraphQLFetch(context)(query, variables);
 * }
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

    return function getGraphQLFetch(context) {
        const previewData = getPreviewData(getVisibility(context));
        if (!previewData) {
            return cachedGraphQLFetch;
        }
        // Preview content must always be up to date
        return createGraphQLFetch(createFetchWithDefaults(fetch, { headers: { ...headers, ...convertPreviewDataToHeaders(previewData) } }), url);
    };
}
