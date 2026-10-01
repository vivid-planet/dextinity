import { persistedQueryRoute } from "@dextinity/site-nextjs/server";
import { SYSTEM_USER_NAME } from "@src/auth/constants";

export const dynamic = "force-dynamic";

async function handler(request: Request) {
    return persistedQueryRoute(request, {
        graphqlTarget: `${process.env.API_URL_INTERNAL}/graphql`,
        headers: {
            authorization: `Basic ${Buffer.from(`${SYSTEM_USER_NAME}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
        },
        persistedQueriesPath: ".next/persisted-queries.json",
        cacheMaxAge: 450, //Cache for 7.5 minutes (450 seconds) in CDNs and browsers
    });
}

export { handler as GET, handler as POST };
