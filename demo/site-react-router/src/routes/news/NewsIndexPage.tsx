import { cacheControlHeaders } from "@dextinity/site-react-router";
import { NewsPage } from "@src/news/NewsPage";
import { getGraphQLFetch } from "@src/util/graphQLClient.server";
import { getPageHeaders } from "@src/util/pageCacheControl.server";
import { getSiteContext } from "@src/util/siteContext";
import { data } from "react-router";

import type { Route } from "./+types/NewsIndexPage";
import { loadNewsIndexPage } from "./loadNewsPages.server";

export const headers = cacheControlHeaders;

export async function loader({ params, context }: Route.LoaderArgs) {
    const scope = { domain: getSiteContext(context).domain, language: params.language };
    return data(await loadNewsIndexPage({ scope, graphQLFetch: getGraphQLFetch(context) }), getPageHeaders(context));
}

export default function NewsIndexPage({ loaderData }: Route.ComponentProps) {
    return <NewsPage scope={loaderData.scope} initialData={loaderData.initialData} />;
}
