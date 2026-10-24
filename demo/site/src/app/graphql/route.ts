import { persistedQueryRoute } from "@dextinity/site-react/server";
import { SYSTEM_USER_NAME } from "@src/auth/constants";
import { getPreviewParams } from "@src/util/sitePreview";
import type { Context } from "hono";

export async function graphQLRoute(c: Context) {
    const preview = await getPreviewParams();
    return persistedQueryRoute(c.req.raw, {
        graphqlTarget: `${process.env.API_URL_INTERNAL}/graphql`,
        headers: {
            authorization: `Basic ${Buffer.from(`${SYSTEM_USER_NAME}:${process.env.API_BASIC_AUTH_SYSTEM_USER_PASSWORD}`).toString("base64")}`,
        },
        persistedQueriesPath: "dist/persisted-queries.json",
        cacheMaxAge: 450, //Cache for 7.5 minutes (450 seconds) in CDNs and browsers
        previewData: preview?.previewData,
    });
}
