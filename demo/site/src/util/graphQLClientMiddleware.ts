import { createFetchWithDefaults, createGraphQLFetch } from "@dextinity/site-nextjs";
import { SYSTEM_USER_NAME } from "@src/auth/constants";

export function createGraphQLFetchMiddleware() {
    if (!process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD) {
        throw new Error("API_BASIC_AUTH_SYSTEM_USER_PASSWORD is not set");
    }

    return createGraphQLFetch(
        createFetchWithDefaults(fetch, {
            next: {
                revalidate: 7.5 * 60,
            },
            headers: {
                authorization: `Basic ${Buffer.from(`${SYSTEM_USER_NAME}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
            },
        }),
        `${process.env.API_URL_INTERNAL}/graphql`,
    );
}
