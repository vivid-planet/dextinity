import { File, FileNotMenu, Link, LinkNotMenu } from "@dextinity/admin-icons";
import type { PageTreeCategory, PageTreeDocumentType } from "@dextinity/serverless/client";
import { FormattedMessage } from "react-intl";

import {
    pageTreeCategories as categories,
    type PageTreeCategory as Category,
    type pageTreeDocumentTypes as documentTypes,
} from "../shared/page-tree";
import { LinkBlock } from "./common/blocks/LinkBlock";
import { PageContentBlock } from "./documents/pages/blocks/PageContentBlock";
import { SeoBlock } from "./documents/pages/blocks/SeoBlock";
import { StageBlock } from "./documents/pages/blocks/StageBlock";

const categoryLabels: Record<Category, PageTreeCategory["label"]> = {
    mainNavigation: <FormattedMessage id="pageTree.category.mainNavigation" defaultMessage="Main navigation" />,
    topMenu: <FormattedMessage id="pageTree.category.topMenu" defaultMessage="Top menu" />,
};

export const pageTreeCategories: PageTreeCategory[] = categories.map((category) => ({ category, label: categoryLabels[category] }));

export const pageTreeDocumentTypes: Record<(typeof documentTypes)[number], PageTreeDocumentType> = {
    Page: {
        label: <FormattedMessage id="pageTree.documentType.page" defaultMessage="Page" />,
        icon: <File />,
        hideInMenuIcon: <FileNotMenu />,
        rootBlocks: {
            content: {
                label: <FormattedMessage id="pageTree.page.content" defaultMessage="Blocks" />,
                block: PageContentBlock,
                previewPath: "/page",
            },
            stage: { label: <FormattedMessage id="pageTree.page.stage" defaultMessage="Stage" />, block: StageBlock, previewPath: "/stage" },
            seo: { label: <FormattedMessage id="pageTree.page.seo" defaultMessage="Config" />, block: SeoBlock },
        },
    },
    Link: {
        label: <FormattedMessage id="pageTree.documentType.link" defaultMessage="Link" />,
        icon: <Link />,
        hideInMenuIcon: <LinkNotMenu />,
        rootBlocks: {
            content: { label: <FormattedMessage id="pageTree.link.content" defaultMessage="Link" />, block: LinkBlock },
        },
    },
};
