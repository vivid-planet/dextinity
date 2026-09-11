import { type ApolloClient, gql } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";

const slugAvailableQuery = gql`
    query FindAvailableSlug($parentId: ID, $slug: String!, $scope: PageTreeNodeScopeInput!) {
        pageTreeNodeSlugAvailable(parentId: $parentId, slug: $slug, scope: $scope)
    }
`;

export async function findAvailableSlug(
    apolloClient: ApolloClient<unknown>,
    { slug, name, parentId, scope }: { slug: string; name: string; parentId: string | null; scope: Record<string, unknown> },
): Promise<{ slug: string; name: string }> {
    let candidateSlug = slug;
    let candidateName = name;
    let duplicateNumber = 1;

    while (true) {
        const { data } = await apolloClient.query({
            query: slugAvailableQuery,
            variables: { parentId, slug: candidateSlug, scope },
            fetchPolicy: "network-only",
            context: LocalErrorScopeApolloContext,
        });

        if (data.pageTreeNodeSlugAvailable === "Available") {
            return { slug: candidateSlug, name: candidateName };
        }

        ++duplicateNumber;
        candidateName = `${name} ${duplicateNumber}`;
        candidateSlug = `${slug}-${duplicateNumber}`;
    }
}
