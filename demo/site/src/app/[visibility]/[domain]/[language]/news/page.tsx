export const dynamic = "error";

import { JsonLd } from "@dextinity/site-nextjs";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { NewsPage } from "@src/news/NewsPage";
import { fetchNewsList } from "@src/news/NewsPage.loader";
import { setVisibilityParam } from "@src/util/ServerContext";
import { buildNewsItemList } from "@src/util/structuredData/buildNewsItemList";
import type { ItemList } from "schema-dts";

export default async function NewsIndexPage({ params }: PageProps<"/[visibility]/[domain]/[language]/news">) {
    const { visibility, domain, language } = await params;
    setVisibilityParam(visibility as VisibilityParam);

    const scope = { domain, language };
    const initialData = await fetchNewsList({ scope, limit: 2 });

    // Only the initially rendered page is encoded — client-side "Load more" items are not part of the ItemList.
    const itemList = buildNewsItemList({ items: initialData.nodes, scope });

    return (
        <>
            <JsonLd<ItemList> data={itemList} />
            <NewsPage scope={scope} initialData={initialData} />
        </>
    );
}
