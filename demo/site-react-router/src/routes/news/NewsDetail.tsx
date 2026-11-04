import { NewsArticleJsonLd } from "@src/news/NewsArticleJsonLd";
import type { ContentScope } from "@src/site-configs";
import { graphQLFetch } from "@src/util/graphQLClient";

import { fetchNews } from "./loadNewsPages";
import { NewsDetailContent } from "./NewsDetailContent";

export async function NewsDetail({ scope, slug }: { scope: ContentScope; slug: string }) {
    const news = await fetchNews({ scope, slug, graphQLFetch });

    return (
        <>
            <NewsArticleJsonLd news={news} scope={scope} />
            <NewsDetailContent news={news} />
        </>
    );
}
