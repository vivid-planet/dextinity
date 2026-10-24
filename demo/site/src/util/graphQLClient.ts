import {
    convertPreviewDataToHeaders,
    createFetchWithDefaults,
    createGraphQLFetch as createGraphQLFetchLibrary,
    type GraphQLFetch,
} from "@dextinity/site-react";
import { SYSTEM_USER_NAME } from "@src/auth/constants";
import { getVisibility } from "@src/framework/requestContext";

import { createCachingFetch } from "./fetchCache";

type Fetch = typeof fetch;

// Cache for 7.5 minutes to get an effective cache duration of 15 minutes if a CDN cache is enabled
const cachingFetch = createCachingFetch(fetch, { revalidateInSeconds: 7.5 * 60 });

/**
 * Creates a GraphQL fetch for server-side rendering. Use `createBrowserGraphQLFetch` in the browser.
 */
export function createGraphQLFetch({ fetch: passedFetch }: { fetch?: Fetch } = {}): GraphQLFetch {
    if (!process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD) {
        throw new Error("API_BASIC_AUTH_SYSTEM_USER_PASSWORD is not set");
    }

    const visibility = getVisibility();
    const previewData = visibility === "default" ? undefined : { includeInvisible: visibility === "invisibleBlocks" };

    return createGraphQLFetchLibrary(
        // Preview content must always be up to date
        createFetchWithDefaults(passedFetch ?? (previewData ? fetch : cachingFetch), {
            headers: {
                authorization: `Basic ${Buffer.from(`${SYSTEM_USER_NAME}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
                ...convertPreviewDataToHeaders(previewData),
            },
        }),
        `${process.env.API_URL_INTERNAL}/graphql`,
    );
}
