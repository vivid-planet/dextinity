import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { getSiteConfigForDomain } from "@src/util/getSiteConfigs";
import type { ItemList, WithContext } from "schema-dts";

type NewsItemListEntry = {
    title: string;
    slug: string;
    scope: { language: string };
};

type BuildNewsItemListOptions = {
    items: NewsItemListEntry[];
    scope: ContentScope;
};

export function buildNewsItemList({ items, scope }: BuildNewsItemListOptions): WithContext<ItemList> {
    const siteUrl = getSiteConfigForDomain(scope.domain).url;

    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.title,
            url: `${siteUrl}${createSitePath({ scope: { language: item.scope.language }, path: `/news/${item.slug}` })}`,
        })),
    };
}
