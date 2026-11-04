import { cacheControlHeaders } from "@dextinity/site-react-router";
import { getGraphQLFetch } from "@src/util/graphQLClient";
import { getPageHeaders } from "@src/util/pageCacheControl";
import { getSiteContext } from "@src/util/siteContext";
import { data } from "react-router";

import type { Route } from "./+types/NewsDetailPage";
import { fetchNews } from "./loadNewsPages";
import { NewsDetail } from "./NewsDetail";

export const headers = cacheControlHeaders;

export const meta: Route.MetaFunction = ({ loaderData }) => (loaderData ? [{ title: loaderData.title }] : []);

export async function loader({ params, context }: Route.LoaderArgs) {
    const scope = { domain: getSiteContext(context).domain, language: params.language };
    const news = await fetchNews({ scope, slug: params.slug, graphQLFetch: getGraphQLFetch(context) });
    return data({ scope, title: news.title }, getPageHeaders(context));
}

export function ServerComponent({ loaderData, params }: Route.ServerComponentProps) {
    return <NewsDetail scope={loaderData.scope} slug={params.slug} />;
}
