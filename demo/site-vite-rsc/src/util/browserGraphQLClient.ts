import { createPersistedQueryGraphQLFetch, type GraphQLFetch } from "@dextinity/site-react";

type Fetch = typeof fetch;

export function createBrowserGraphQLFetch({ fetch: passedFetch }: { fetch?: Fetch } = {}): GraphQLFetch {
    return createPersistedQueryGraphQLFetch(
        passedFetch || fetch,
        `/graphql`, // bff api route
    );
}
