import { createPersistedQueryGraphQLFetch, type GraphQLFetch } from "@dextinity/site-react-router";

type Fetch = typeof fetch;

/**
 * The GraphQL fetch of client components, which sends the persisted queries to the BFF route of the site (routes/graphQLRoute.ts)
 */
export function createBrowserGraphQLFetch({ fetch: passedFetch = fetch }: { fetch?: Fetch } = {}): GraphQLFetch {
    return createPersistedQueryGraphQLFetch(passedFetch, "/graphql");
}
