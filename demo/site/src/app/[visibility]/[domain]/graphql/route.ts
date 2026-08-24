import { persistedQueryRoute } from "@dextinity/site-nextjs/server";
import { createSystemUserAuthorizationHeader } from "@src/util/createSystemUserAuthorizationHeader";

export const dynamic = "force-dynamic";

async function handler(request: Request) {
    return persistedQueryRoute(request, {
        graphqlTarget: `${process.env.API_URL_INTERNAL}/graphql`,
        headers: {
            authorization: createSystemUserAuthorizationHeader(),
        },
        persistedQueriesPath: ".next/persisted-queries.json",
        cacheMaxAge: 450, //Cache for 7.5 minutes (450 seconds) in CDNs and browsers
    });
}

export { handler as GET, handler as POST };
