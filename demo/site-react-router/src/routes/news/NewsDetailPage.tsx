import { loadNewsDetail } from "@src/news/loadNewsDetail";
import { NewsArticleJsonLd } from "@src/news/NewsArticleJsonLd";
import { NewsDetail } from "@src/news/NewsDetail";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { getSiteContext } from "@src/util/siteContext";

import type { Route } from "./+types/NewsDetailPage";

export async function loader({ params, context }: Route.LoaderArgs) {
    const scope = { domain: getSiteContext(context).domain, language: params.language };
    return { scope, news: await loadNewsDetail({ scope, slug: params.slug, graphQLFetch: createGraphQLFetch(context) }) };
}

export const meta: Route.MetaFunction = ({ loaderData }) => [{ title: loaderData?.news.title }];

export function ServerComponent({ loaderData: { scope, news } }: Route.ServerComponentProps) {
    return (
        <>
            <NewsArticleJsonLd news={news} scope={scope} />
            <NewsDetail news={news} />
        </>
    );
}
