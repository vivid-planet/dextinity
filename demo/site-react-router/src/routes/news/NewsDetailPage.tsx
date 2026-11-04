import { cacheControlHeaders } from "@dextinity/site-react-router";
import { NewsArticleJsonLd } from "@src/news/NewsArticleJsonLd";
import { getGraphQLFetch } from "@src/util/graphQLClient.server";
import { getPageHeaders } from "@src/util/pageCacheControl.server";
import { getSiteContext } from "@src/util/siteContext";
import { data } from "react-router";

import type { Route } from "./+types/NewsDetailPage";
import { loadNewsDetailPage } from "./loadNewsPages.server";
import { NewsDetailContent } from "./NewsDetailContent";

export const headers = cacheControlHeaders;

export const meta: Route.MetaFunction = ({ loaderData }) => loaderData?.metadata ?? [];

export async function loader({ params, context }: Route.LoaderArgs) {
    const scope = { domain: getSiteContext(context).domain, language: params.language };
    return data(await loadNewsDetailPage({ scope, slug: params.slug, graphQLFetch: getGraphQLFetch(context) }), getPageHeaders(context));
}

export default function NewsDetailPage({ loaderData: { news, scope } }: Route.ComponentProps) {
    return (
        <>
            <NewsArticleJsonLd news={news} scope={scope} />
            <NewsDetailContent news={news} />
        </>
    );
}
