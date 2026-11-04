import { NewsPage } from "@src/news/NewsPage";
import { fetchNewsList } from "@src/news/NewsPage.loader";
import type { ContentScope } from "@src/site-configs";
import { graphQLFetch } from "@src/util/graphQLClient";

export async function NewsIndex({ scope }: { scope: ContentScope }) {
    const initialData = await fetchNewsList({ graphQLFetch, scope, limit: 2 });

    return <NewsPage scope={scope} initialData={initialData} />;
}
