import { type BlockLoader, type BlockLoaderDependencies, recursivelyLoadBlockData as baseRecursivelyLoadBlockData } from "@dextinity/site-nextjs";
import type { AllBlockNames } from "@src/blocks.generated";
import { loader as pageTreeIndexLoader } from "@src/common/blocks/PageTreeIndexBlock.loader";
import { loader as newsDetailLoader } from "@src/news/blocks/NewsDetailBlock.loader";
import { loader as newsListLoader } from "@src/news/blocks/NewsListBlock.loader";
import { loader as productTeaserLoader } from "@src/products/blocks/ProductTeaserBlock.loader";
import type { ContentScope } from "@src/site-configs";

declare module "@dextinity/site-nextjs" {
    export interface BlockLoaderDependencies {
        pageTreeNodeId?: string;
        scope: ContentScope;
    }
}

const blockLoaders: Partial<Record<AllBlockNames, BlockLoader>> = {
    NewsDetail: newsDetailLoader,
    NewsList: newsListLoader,
    PageTreeIndex: pageTreeIndexLoader,
    ProductTeaser: productTeaserLoader,
};

//small wrapper for @dextinity/site-nextjs recursivelyLoadBlockData that injects blockMeta from block-meta.json
export async function recursivelyLoadBlockData(options: { blockType: string; blockData: unknown } & BlockLoaderDependencies) {
    const blocksMeta = await import("../../block-meta.json"); //dynamic import to avoid this json in client bundle
    return baseRecursivelyLoadBlockData({ ...options, blocksMeta: blocksMeta.default, loaders: blockLoaders });
}
