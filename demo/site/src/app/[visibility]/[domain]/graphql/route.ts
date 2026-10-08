import { persistedQueryRoute, previewParams } from "@comet/site-nextjs";

export const dynamic = "force-dynamic";

async function handler(request: Request) {
    const preview = await previewParams();
    return persistedQueryRoute(request, {
        graphqlTarget: `${process.env.API_URL_INTERNAL}/graphql`,
        headers: {
            authorization: `Basic ${Buffer.from(`system-user:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
        },
        persistedQueriesPath: ".next/persisted-queries.json",
        cacheMaxAge: 450, //Cache for 7.5 minutes (450 seconds) in CDNs and browsers
        previewData: preview?.previewData,
    });
}

export { handler as GET, handler as POST };
