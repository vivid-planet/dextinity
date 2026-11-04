import { persistedQueryRoute } from "@dextinity/site-react/server";
import { SYSTEM_USER_NAME } from "@src/auth/constants";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/graphQLRoute";

/**
 * The BFF route for the GraphQL queries of the browser, it only executes the persisted queries of the client build
 */
function graphQLRoute({ request, context }: { request: Request; context: Route.LoaderArgs["context"] }) {
    return persistedQueryRoute(request, {
        graphqlTarget: `${process.env.API_URL_INTERNAL}/graphql`,
        headers: {
            authorization: `Basic ${Buffer.from(`${SYSTEM_USER_NAME}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
        },
        persistedQueriesPath: "build/persisted-queries.json",
        cacheMaxAge: 450, //Cache for 7.5 minutes (450 seconds) in CDNs and browsers
        previewData: getSiteContext(context).sitePreview?.previewData,
    });
}

export function loader(args: Route.LoaderArgs) {
    return graphQLRoute(args);
}

export function action(args: Route.ActionArgs) {
    return graphQLRoute(args);
}
