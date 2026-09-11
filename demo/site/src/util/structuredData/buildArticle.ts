import type { DamImageBlockData } from "@src/blocks.generated";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import type { Article, WithContext } from "schema-dts";

import { damImageToAbsoluteUrls } from "./damImageToAbsoluteUrls";

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
    const images = damImageToAbsoluteUrls(news.image, siteConfig.url);
    const detailUrl = `${siteConfig.url}${createSitePath({ scope: { language: scope.language }, path: `/news/${news.slug}` })}`;

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: news.title,
        ...(images.length > 0 ? { image: images } : {}),
        datePublished: news.date,
        dateModified: news.updatedAt,
        mainEntityOfPage: detailUrl,
    };
}
