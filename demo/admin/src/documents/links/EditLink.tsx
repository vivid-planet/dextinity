import { gql } from "@apollo/client";
import { messages } from "@dextinity/admin";
import { BlockAdminComponentRoot, createUsePage, PageContentEditor } from "@dextinity/cms-admin";
import { LinkBlock } from "@src/common/blocks/LinkBlock";
import { useIntl } from "react-intl";

import type { GQLEditLinkQuery, GQLEditLinkQueryVariables, GQLUpdateLinkMutation, GQLUpdateLinkMutationVariables } from "./EditLink.generated";

const usePage = createUsePage({
    rootBlocks: {
        content: LinkBlock,
    },
    pageType: "Link",
})<GQLEditLinkQuery, GQLEditLinkQueryVariables, GQLUpdateLinkMutation["saveLink"], GQLUpdateLinkMutationVariables>({
    getQuery: gql`
        query EditLink($id: ID!) {
            page: pageTreeNode(id: $id) {
                id
                name
                slug
                parentId
                document {
                    ... on DocumentInterface {
                        id
                        updatedAt
                    }
                    __typename
                    ... on Link {
                        content
                    }
                }
            }
        }
    `,
    updateMutation: gql`
        mutation UpdateLink($pageId: ID!, $input: LinkInput!, $lastUpdatedAt: DateTime, $attachedPageTreeNodeId: ID!) {
            saveLink(id: $pageId, input: $input, lastUpdatedAt: $lastUpdatedAt, attachedPageTreeNodeId: $attachedPageTreeNodeId) {
                id
                content
                updatedAt
            }
        }
    `,
});

interface Props {
    id: string;
}

export const EditLink = ({ id }: Props) => {
    const intl = useIntl();
    const pageApi = usePage({ pageId: id });

    return (
        <PageContentEditor
            pageId={id}
            pageApi={pageApi}
            tabs={[
                {
                    key: "content",
                    label: intl.formatMessage(messages.content),
                    invalid: pageApi.rootBlocksValidity.content === false,
                    content: <BlockAdminComponentRoot>{pageApi.rootBlocksApi.content.adminUI}</BlockAdminComponentRoot>,
                },
            ]}
        />
    );
};
