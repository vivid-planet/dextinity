import { type BlockInputInterface, SitemapPageChangeFrequency, SitemapPagePriority } from "@dextinity/cms-api";
import { SeoBlock } from "@src/documents/pages/blocks/seo.block.js";

export const generateSeoBlock = (): BlockInputInterface => {
    // @TODO Introduce randomness
    return SeoBlock.blockInputFactory({
        htmlTitle: "",
        metaDescription: "",
        openGraphTitle: "",
        openGraphDescription: "",
        openGraphImage: { block: null, visible: false },
        structuredData: null,
        canonicalUrl: null,
        alternativeLinks: [],
        noIndex: false,
        priority: SitemapPagePriority._0_5,
        changeFrequency: SitemapPageChangeFrequency.weekly,
    });
};
