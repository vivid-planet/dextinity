import { persistedQueryRoute } from "@dextinity/site-react-router/server";
import { SYSTEM_USER_NAME } from "@src/auth/constants";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/graphQLRoute";

/**
 * The BFF of the client components, which only allows the persisted queries of the client code (see `persistedQueriesPlugin()` in vite.config.ts)
 */
function handleGraphQLRequest({ request, context }: Route.LoaderArgs | Route.ActionArgs) {
    return persistedQueryRoute(request, {
        graphqlTarget: `${process.env.API_URL_INTERNAL}/graphql`,
        headers: {
            authorization: `Basic ${Buffer.from(`${SYSTEM_USER_NAME}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
        },
        persistedQueriesPath: "build/persisted-queries.json",
        cacheMaxAge: 450, // Cache for 7.5 minutes in CDNs and browsers
        previewData: getSiteContext(context).sitePreview?.previewData,
    });
}

export { handleGraphQLRequest as action, handleGraphQLRequest as loader };
