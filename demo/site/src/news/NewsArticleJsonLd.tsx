import { generateImageUrl, gql, JsonLd } from "@dextinity/site-nextjs";
import type { DamImageBlockData } from "@src/blocks.generated";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import type { Article, WithContext } from "schema-dts";

import type { GQLNewsArticleJsonLdFragment } from "./NewsArticleJsonLd.generated";

export const newsArticleJsonLdFragment = gql`
    fragment NewsArticleJsonLd on News {
        title
        image
        date
        updatedAt
        slug
    }
`;

interface Props {
    news: GQLNewsArticleJsonLdFragment;
    scope: ContentScope;
}

// Google recommends providing the article image in these aspect ratios.
// https://developers.google.com/search/docs/appearance/structured-data/article
const aspectRatios = [16 / 9, 4 / 3, 1];
const maxWidth = 1200;

function articleImageUrls(image: DamImageBlockData, siteUrl: string): string[] {
    const props = image.block?.props;

    if (!props) {
        return [];
    }

    if ("urlTemplate" in props && props.damFile?.image) {
        const width = Math.min(props.damFile.image.width, maxWidth);
        return aspectRatios.map((aspectRatio) => new URL(generateImageUrl({ src: props.urlTemplate, width }, aspectRatio), siteUrl).toString());
    }

    return props.damFile?.fileUrl ? [new URL(props.damFile.fileUrl, siteUrl).toString()] : [];
}

export function NewsArticleJsonLd({ news, scope }: Props) {
    const siteConfig = getSiteConfigForDomain(scope.domain);
    const images = articleImageUrls(news.image, siteConfig.url);

    const data: WithContext<Article> = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: news.title,
        ...(images.length > 0 ? { image: images } : {}),
        datePublished: news.date,
        dateModified: news.updatedAt,
        mainEntityOfPage: `${siteConfig.url}${createSitePath({ scope: { language: scope.language }, path: `/news/${news.slug}` })}`,
    };

    return <JsonLd<Article> data={data} />;
}
