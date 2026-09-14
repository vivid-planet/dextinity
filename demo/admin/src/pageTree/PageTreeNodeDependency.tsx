import { gql } from "@apollo/client";
import type { DependencyInterface } from "@dextinity/cms-admin";
import { categoryToUrlParam } from "@src/pageTree/pageTreeCategories";
import type { GQLpageTreeNodeDependencyQuery, GQLpageTreeNodeDependencyQueryVariables } from "@src/pageTree/PageTreeNodeDependency.generated";
import { FormattedMessage } from "react-intl";

export const PageTreeNodeDependency: DependencyInterface = {
    displayName: <FormattedMessage id="pageTreeNode.displayName" defaultMessage="PageTreeNode" />,
    resolvePath: async ({ apolloClient, id }) => {
        const { data, error } = await apolloClient.query<GQLpageTreeNodeDependencyQuery, GQLpageTreeNodeDependencyQueryVariables>({
            query: gql`
                query pageTreeNodeDependency($id: ID!) {
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

        if (error || data.pageTreeNode === null) {
            throw new Error(`Error for PageTreeNode ${id}: ${error?.message ?? "PageTreeNode is undefined"}`);
        }

        return `/pages/pagetree/${categoryToUrlParam(data.pageTreeNode.category)}/${data.pageTreeNode.id}/edit`;
    },
};
