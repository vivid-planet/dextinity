import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { LatestContentUpdatesDashboardWidget, useContentScope } from "@dextinity/cms-admin";
import type { GQLLatestContentUpdatesQueryVariables } from "@src/dashboard/LatestContentUpdates.generated";
import { getPageTreeNodeEditPath } from "@src/pageTree/pageTreeCategories";

import type { GQLLatestContentUpdatesQuery } from "./LatestContentUpdates.generated";

export const LatestContentUpdates = () => {
    const contentScope = useContentScope();
    const { data, loading, error } = useQuery<GQLLatestContentUpdatesQuery, GQLLatestContentUpdatesQueryVariables>(latestContentUpdatesQuery, {
        variables: {
            scope: contentScope.scope,
        },
        notifyOnNetworkStatusChange: false,
    });

    if (error) {
        throw error;
    }
    const rows =
        data?.paginatedPageTreeNodes.nodes.map((node) => ({
            ...node,
            editUrl: `${contentScope.match.url}${getPageTreeNodeEditPath(node)}`,
        })) ?? [];

    return <LatestContentUpdatesDashboardWidget rows={rows} loading={loading} />;
};

const latestContentUpdatesQuery = gql`
    query LatestContentUpdates($scope: PageTreeNodeScopeInput!) {
        paginatedPageTreeNodes(offset: 0, limit: 5, scope: $scope, sort: [{ field: updatedAt, direction: DESC }]) {
            nodes {
                id
                updatedAt
                name
                path
                scope {
                    domain
                    language
                }
                category
            }
            totalCount
        }
    }
`;
