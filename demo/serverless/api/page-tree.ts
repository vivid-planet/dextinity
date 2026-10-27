import type { PageTreeConfig } from "@dextinity/serverless/server";

import { pageTreeCategories, type pageTreeDocumentTypes } from "../shared/page-tree";
import { LinkBlock } from "./common/blocks/link.block";
import { PageContentBlock } from "./documents/pages/blocks/page-content.block";
import { SeoBlock } from "./documents/pages/blocks/seo.block";
import { StageBlock } from "./documents/pages/blocks/stage.block";

const documentTypes: Record<(typeof pageTreeDocumentTypes)[number], PageTreeConfig["documentTypes"][string]> = {
    Page: { rootBlocks: { content: PageContentBlock, seo: SeoBlock, stage: StageBlock } },
    Link: { rootBlocks: { content: LinkBlock } },
};

export const pageTreeConfig: PageTreeConfig = {
    categories: pageTreeCategories,
    documentTypes,
};
