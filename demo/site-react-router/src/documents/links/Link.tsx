import { gql, type GraphQLFetch } from "@dextinity/site-react-router";
import type { DamFileDownloadLinkBlockData, ExternalLinkBlockData, InternalLinkBlockData } from "@src/blocks.generated";

import type { GQLLinkRedirectQuery, GQLLinkRedirectQueryVariables } from "./Link.generated";

const linkRedirectQuery = gql`
    query LinkRedirect($id: ID!) {
        pageTreeNode(id: $id) {
            document {
                __typename
                ... on Link {
                    content
                }
            }
        }
    }
`;

/**
 * The target of a link document of the page tree, which the document page redirects to
 */
export async function getLinkTarget({
    pageTreeNodeId,
    graphQLFetch,
}: {
    pageTreeNodeId: string;
    graphQLFetch: GraphQLFetch;
}): Promise<string | undefined> {
    const { pageTreeNode } = await graphQLFetch<GQLLinkRedirectQuery, GQLLinkRedirectQueryVariables>(linkRedirectQuery, { id: pageTreeNodeId });

    if (pageTreeNode?.document?.__typename !== "Link") {
        return undefined;
    }
    const { block } = pageTreeNode.document.content;

    switch (block?.type) {
        case "internal":
            return (block.props as InternalLinkBlockData).targetPage?.path;
        case "external":
            return (block.props as ExternalLinkBlockData).targetUrl;
        case "damFileDownload":
            return (block.props as DamFileDownloadLinkBlockData).file?.fileUrl.replace("/download", "");
        default:
            return undefined;
    }
}
