import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import type { ItemList, WithContext } from "schema-dts";

type NewsItemListEntry = {
    title: string;
    slug: string;
};

type BuildNewsItemListOptions = {
    items: NewsItemListEntry[];
    // All items of a list belong to the same content scope, so the URLs are built from a single scope.
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
            url: `${siteUrl}${createSitePath({ scope: { language: scope.language }, path: `/news/${item.slug}` })}`,
        })),
    };
}
