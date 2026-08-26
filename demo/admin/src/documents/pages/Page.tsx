import { gql } from "@apollo/client";
import { messages } from "@dextinity/admin";
import { File, FileNotMenu } from "@dextinity/admin-icons";
import {
    createDocumentDependencyMethods,
    createDocumentRootBlocksMethods,
    createDocumentTranslationMethods,
    type DependencyInterface,
    type DocumentInterface,
    type InfoTagProps,
    type TranslatableInterface,
} from "@dextinity/cms-admin";
import { Chip } from "@mui/material";
import type { GQLPageTreeNodeAdditionalFieldsFragment } from "@src/common/EditPageNode";
import type { GQLPage, GQLPageInput } from "@src/graphql.generated";
import { categoryToUrlParam } from "@src/pageTree/pageTreeCategories";
import { FormattedMessage } from "react-intl";

import { PageContentBlock } from "./blocks/PageContentBlock";
import { SeoBlock } from "./blocks/SeoBlock";
import { StageBlock } from "./blocks/StageBlock";
import { EditPage } from "./EditPage";

const rootBlocks = {
    content: PageContentBlock,
    seo: SeoBlock,
    stage: StageBlock,
};

export const Page: DocumentInterface<Pick<GQLPage, "content" | "seo">, GQLPageInput> &
    TranslatableInterface<Pick<GQLPage, "content" | "seo">, GQLPageInput> &
    DependencyInterface = {
    displayName: <FormattedMessage {...messages.page} />,
    editComponent: EditPage,
    menuIcon: File,
    hideInMenuIcon: FileNotMenu,
    getQuery: gql`
        query PageDocument($id: ID!) {
            page: pageTreeNode(id: $id) {
                id
                path
                document {
                    ... on DocumentInterface {
                        id
                        updatedAt
                    }

                    __typename
                    ... on Page {
                        content
                        seo
                        stage
                    }
                }
            }
        }
    `,
    updateMutation: gql`
        mutation UpdatePage($pageId: ID!, $input: PageInput!, $lastUpdatedAt: DateTime, $attachedPageTreeNodeId: ID) {
            savePage(pageId: $pageId, input: $input, lastUpdatedAt: $lastUpdatedAt, attachedPageTreeNodeId: $attachedPageTreeNodeId) {
                id
                content
                seo
                stage
                updatedAt
            }
        }
    `,
    InfoTag: ({ page }: InfoTagProps<GQLPageTreeNodeAdditionalFieldsFragment>) => {
        if (page.userGroup !== "all") {
            return <Chip size="small" label={page.userGroup} />;
        }
        return null;
    },
    ...createDocumentRootBlocksMethods(rootBlocks),
    ...createDocumentTranslationMethods(rootBlocks),
    ...createDocumentDependencyMethods({
        rootQueryName: "page",
        rootBlocks: {
            content: PageContentBlock,
            seo: { block: SeoBlock, path: "/config" },
            stage: { block: StageBlock, path: "/stage" },
        },
        basePath: ({ pageTreeNode }) => `/pages/pagetree/${categoryToUrlParam(pageTreeNode.category)}/${pageTreeNode.id}/edit`,
    }),
};
