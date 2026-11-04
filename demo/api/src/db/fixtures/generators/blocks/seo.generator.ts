import { type BlockInputInterface, SitemapPageChangeFrequency, SitemapPagePriority } from "@dextinity/cms-api";
import { SeoBlock } from "@src/documents/pages/blocks/seo.block";

export const generateSeoBlock = (): BlockInputInterface => {
    // @TODO Introduce randomness
    return SeoBlock.blockInputFactory({
        htmlTitle: "",
        metaDescription: "",
        openGraphTitle: "",
        openGraphDescription: "",
        openGraphImage: { block: undefined, visible: false },
        structuredData: undefined,
        canonicalUrl: undefined,
        alternativeLinks: [],
        noIndex: false,
        priority: SitemapPagePriority._0_5,
        changeFrequency: SitemapPageChangeFrequency.weekly,
    });
};
