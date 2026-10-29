import { createServerGraphQLFetch } from "@dextinity/site-vite-rsc/server";
import { SYSTEM_USER_NAME } from "@src/auth/constants";

import { createFetchCacheStore } from "./fetchCacheStore";

if (!process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD) {
    throw new Error("API_BASIC_AUTH_SYSTEM_USER_PASSWORD is not set");
}

/**
 * The GraphQL fetch for server components. Use `createBrowserGraphQLFetch` in the browser.
 */
export const graphQLFetch = createServerGraphQLFetch({
    url: `${process.env.API_URL_INTERNAL}/graphql`,
    headers: {
        authorization: `Basic ${Buffer.from(`${SYSTEM_USER_NAME}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
    },
    // Cache for 7.5 minutes to get an effective cache duration of 15 minutes if a CDN cache is enabled
    cache: { revalidateInSeconds: 7.5 * 60, store: createFetchCacheStore() },
});
