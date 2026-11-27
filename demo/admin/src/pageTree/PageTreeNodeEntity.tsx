import { gql } from "@apollo/client";
import { PageTree } from "@dextinity/admin-icons";
import type { EntityInterface } from "@dextinity/cms-admin";
import { categoryToUrlParam } from "@src/pageTree/pageTreeCategories";
import type { GQLPageTreeNodeEntityQuery, GQLPageTreeNodeEntityQueryVariables } from "@src/pageTree/PageTreeNodeEntity.generated";
import { FormattedMessage } from "react-intl";

export const PageTreeNodeEntity: EntityInterface = {
    displayName: <FormattedMessage id="pageTreeNode.displayName" defaultMessage="PageTreeNode" />,
    icon: PageTree,
    resolvePath: async ({ apolloClient, id }) => {
        const { data, error } = await apolloClient.query<GQLPageTreeNodeEntityQuery, GQLPageTreeNodeEntityQueryVariables>({
            query: gql`
                query PageTreeNodeEntity($id: ID!) {
                    pageTreeNode(id: $id) {
                        id
                        category
                    }
                }
            `,
            variables: {
                id,
            },
        });

        if (error || !data?.pageTreeNode) {
            throw new Error(`Error for PageTreeNode ${id}: ${error?.message ?? "PageTreeNode is undefined"}`);
        }

        return `/pages/pagetree/${categoryToUrlParam(data.pageTreeNode.category)}/${data.pageTreeNode.id}/edit`;
    },
};
