import { createFetchWithDefaults, createGraphQLFetch } from "@dextinity/site-nextjs";

import { createSystemUserAuthorizationHeader } from "./createSystemUserAuthorizationHeader";

export function createGraphQLFetchMiddleware() {
    return createGraphQLFetch(
        createFetchWithDefaults(fetch, {
            next: {
                revalidate: 7.5 * 60,
            },
            headers: {
                authorization: createSystemUserAuthorizationHeader(),
            },
        }),
        `${process.env.API_URL_INTERNAL}/graphql`,
    );
}
