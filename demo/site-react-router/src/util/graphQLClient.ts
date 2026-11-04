import {
    convertPreviewDataToHeaders,
    createFetchWithDefaults,
    createGraphQLFetch as createGraphQLFetchLibrary,
    type GraphQLFetch,
    type PreviewData,
} from "@dextinity/site-react-router";
import { createCachingFetch } from "@dextinity/site-react-router/server";
import { SYSTEM_USER_NAME } from "@src/auth/constants";
import type { RouterContextProvider } from "react-router";

import { fetchCacheStore } from "./fetchCacheStore";
import { getSiteContext, type Visibility } from "./siteContext";

// A revalidation after 7.5 minutes results in a cache duration of 15 minutes with a CDN, like the Next.js site
const cachingFetch = createCachingFetch(fetch, { store: fetchCacheStore, revalidateInSeconds: 7.5 * 60 });

function getPreviewData(visibility: Visibility): PreviewData | undefined {
    if (visibility === "invisibleBlocks") {
        return { includeInvisible: true };
    }
    if (visibility === "invisiblePages") {
        return { includeInvisible: false };
    }
    return undefined;
}

/**
 * The GraphQL fetch of the server, which shows the content of the site preview if the request is part of it.
 * The responses are cached, except the ones of the preview.
 *
 * @param context The context of a loader, action or middleware, server components use the context of the current request
 */
export function createGraphQLFetch(context?: Readonly<RouterContextProvider>): GraphQLFetch {
    if (!process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD) {
        throw new Error("API_BASIC_AUTH_SYSTEM_USER_PASSWORD is not set");
    }
    const previewData = getPreviewData(getSiteContext(context).visibility);

    return createGraphQLFetchLibrary(
        createFetchWithDefaults(previewData ? fetch : cachingFetch, {
            headers: {
                authorization: `Basic ${Buffer.from(`${SYSTEM_USER_NAME}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
                ...convertPreviewDataToHeaders(previewData),
            },
        }),
        `${process.env.API_URL_INTERNAL}/graphql`,
    );
}
