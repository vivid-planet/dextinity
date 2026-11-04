import { generateImageUrl, type PropsWithData } from "@dextinity/site-react";
import Head from "next/head";

import type { PixelImageBlockData, SeoBlockData } from "../../blocks.generated";

type SeoBlockProps<T = PixelImageBlockData> = (T extends PixelImageBlockData
    ? PropsWithData<SeoBlockData> & { resolveOpenGraphImageUrlTemplate?: never }
    : { resolveOpenGraphImageUrlTemplate: (block: T) => string | undefined } & PropsWithData<
          Omit<SeoBlockData, "openGraphImage"> & { openGraphImage: { block?: T } }
      >) & { title: string; canonicalUrl?: string };

/**
 * @deprecated The SeoBlock only works for the pages router and is not compatible with the app router.
 */
export const SeoBlock = <T = PixelImageBlockData,>({
    data: {
        htmlTitle,
        metaDescription,
        openGraphTitle,
        openGraphDescription,
        openGraphImage,
        noIndex,
        canonicalUrl,
        structuredData,
        alternativeLinks,
    },
    title,
    canonicalUrl: passedCanonicalUrl,
    resolveOpenGraphImageUrlTemplate = (block) => (block as PixelImageBlockData).urlTemplate,
}: SeoBlockProps<T>) => {
    const usedHtmlTitle = htmlTitle || title;
    const usedCanonicalUrl = canonicalUrl ?? passedCanonicalUrl;
    const openGraphImageUrlTemplate = openGraphImage.block && resolveOpenGraphImageUrlTemplate(openGraphImage.block as T);

    return (
        <Head>
            <title>{usedHtmlTitle}</title>

            {/* Meta*/}
            {metaDescription && <meta name="description" content={metaDescription} />}

            {/* Open Graph */}
            {openGraphTitle && <meta property="og:title" content={openGraphTitle} />}
            {openGraphDescription && <meta property="og:description" content={openGraphDescription} />}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={usedCanonicalUrl} />
            {openGraphImageUrlTemplate && (
                <meta property="og:image" content={generateImageUrl({ src: openGraphImageUrlTemplate, width: 1200 }, 1200 / 630)} />
            )}

            {/* Structured Data */}
            {structuredData && structuredData.length > 0 && <script type="application/ld+json">{structuredData}</script>}

            {/* No Index */}
            {noIndex && <meta name="robots" content="noindex" />}

            {/* Canonical Url */}
            {usedCanonicalUrl && <link rel="canonical" href={usedCanonicalUrl} />}

            {/* Alternate Hreflang */}
            {alternativeLinks &&
                alternativeLinks.length > 0 &&
                alternativeLinks.map((item) => <link key={item.code} rel="alternate" hrefLang={item.code} href={item.url} />)}
        </Head>
    );
};
