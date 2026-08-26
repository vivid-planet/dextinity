import { gql, useQuery } from "@apollo/client";
import { FileData, FileDataNotMenu } from "@dextinity/admin-icons";
import type { DocumentInterface } from "@dextinity/cms-admin";
import { Chip } from "@mui/material";
import type { GQLPredefinedPage, GQLPredefinedPageInput } from "@src/graphql.generated";
import { FormattedMessage } from "react-intl";

import { EditPredefinedPage } from "./EditPredefinedPage";
import type { GQLPredefinedPageInfoTagQuery, GQLPredefinedPageInfoTagQueryVariables } from "./PredefinedPage.generated";
import { predefinedPageLabels } from "./predefinedPageLabels";

const predefinedPageInfoTagQuery = gql`
    query PredefinedPageInfoTag($id: ID!) {
        page: pageTreeNode(id: $id) {
            id
            document {
                ... on PredefinedPage {
                    id
                    type
                }
            }
        }
    }
`;

export const PredefinedPage: DocumentInterface<Pick<GQLPredefinedPage, "type">, GQLPredefinedPageInput> = {
    displayName: <FormattedMessage id="predefinedPages.displayName" defaultMessage="Predefined Page" />,
    editComponent: EditPredefinedPage,
    getQuery: gql`
        query PredefinedPageDocument($id: ID!) {
            page: pageTreeNode(id: $id) {
                id
                name
                slug
                parentId
                document {
                    ... on PredefinedPage {
                        id
                        type
                    }
                }
            }
        }
    `,
    updateMutation: gql`
        mutation UpdatePredefinedPageDocument($pageId: ID!, $input: PredefinedPageInput!, $lastUpdatedAt: DateTime, $attachedPageTreeNodeId: ID!) {
            savePredefinedPage(id: $pageId, input: $input, lastUpdatedAt: $lastUpdatedAt, attachedPageTreeNodeId: $attachedPageTreeNodeId) {
                id
                type
            }
        }
    `,
    inputToOutput: (input: Pick<GQLPredefinedPage, "type">) => {
        return {
            type: input.type,
        };
    },
    menuIcon: FileData,
    hideInMenuIcon: FileDataNotMenu,
    InfoTag: ({ page }) => {
        const { data } = useQuery<GQLPredefinedPageInfoTagQuery, GQLPredefinedPageInfoTagQueryVariables>(predefinedPageInfoTagQuery, {
            variables: { id: page.id },
            skip: page.documentType !== "PredefinedPage",
        });

        if (data?.page?.document != null) {
            const { type } = data.page.document as GQLPredefinedPage;
            return type ? <Chip label={predefinedPageLabels[type]} /> : null;
        } else {
            return null;
        }
    },
    anchors: () => [],
    dependencies: () => [],
    replaceDependenciesInOutput: (output, replacements) => {
        return output;
    },
};
