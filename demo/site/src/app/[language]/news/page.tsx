import { DefaultTitle } from "@src/layout/DefaultTitle";
import { NewsPage } from "@src/news/NewsPage";
import { fetchNewsList } from "@src/news/NewsPage.loader";
import type { ContentScope } from "@src/site-configs";
import { createGraphQLFetch } from "@src/util/graphQLClient";

export default async function NewsIndexPage({ domain, language }: ContentScope) {
    const initialData = await fetchNewsList({ graphQLFetch: createGraphQLFetch(), scope: { domain, language }, limit: 2 });

    return (
        <>
            <DefaultTitle />
            <NewsPage scope={{ domain, language }} initialData={initialData} />
        </>
    );
}
