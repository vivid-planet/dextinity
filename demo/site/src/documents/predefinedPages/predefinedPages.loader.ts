import { gql, type GraphQLFetch } from "@dextinity/site-nextjs";
import { getSiteConfigForDomain } from "@src/util/siteConfig";

import type { PredefinedPage } from "./predefinedPages";
import type { GQLPredefinedPagesQuery, GQLPredefinedPagesQueryVariables } from "./predefinedPages.loader.generated";

const predefinedPagesQuery = gql`
    query PredefinedPages($scope: PageTreeNodeScopeInput!) {
        paginatedPageTreeNodes(scope: $scope, documentType: "PredefinedPage") {
            nodes {
                id
                path
                document {
                    __typename
                    ... on PredefinedPage {
                        type
                    }
                }
            }
        }
    }
`;

export async function fetchPredefinedPages({ domain, graphQLFetch }: { domain: string; graphQLFetch: GraphQLFetch }): Promise<PredefinedPage[]> {
    const predefinedPagesPerLanguage = await Promise.all(
        getSiteConfigForDomain(domain).scope.languages.map(async (language) => {
            const scope = { domain, language };
            const { paginatedPageTreeNodes } = await graphQLFetch<GQLPredefinedPagesQuery, GQLPredefinedPagesQueryVariables>(
                predefinedPagesQuery,
                { scope },
                { method: "GET" }, //for request memoization
            );

            return paginatedPageTreeNodes.nodes.flatMap((node): PredefinedPage[] =>
                node.document?.__typename === "PredefinedPage" && node.document.type ? [{ type: node.document.type, path: node.path, scope }] : [],
            );
        }),
    );

    return predefinedPagesPerLanguage.flat();
}
