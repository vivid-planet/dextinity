import type { DamImageBlockData } from "@src/blocks.generated";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { getSiteConfigForDomain } from "@src/util/getSiteConfigs";
import type { Article, WithContext } from "schema-dts";

import { buildOrganizationNode } from "./buildOrganization";
import { damImageToAbsoluteUrl } from "./damImageToAbsoluteUrl";

type BuildArticleOptions = {
    news: {
        title: string;
        image: DamImageBlockData;
        date: string;
        updatedAt: string;
        slug: string;
    };
    scope: ContentScope;
};

export function buildArticle({ news, scope }: BuildArticleOptions): WithContext<Article> {
    const siteConfig = getSiteConfigForDomain(scope.domain);
    const organization = buildOrganizationNode(siteConfig);
    const image = damImageToAbsoluteUrl(news.image, siteConfig.url);
    const detailUrl = `${siteConfig.url}${createSitePath({ scope: { language: scope.language }, path: `/news/${news.slug}` })}`;

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: news.title,
        ...(image ? { image } : {}),
        datePublished: news.date,
        dateModified: news.updatedAt,
        author: organization,
        publisher: organization,
        mainEntityOfPage: detailUrl,
    };
}
