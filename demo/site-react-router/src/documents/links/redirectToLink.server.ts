import { gql, type GraphQLFetch } from "@dextinity/site-react";
import { notFound, redirect } from "@dextinity/site-react-router";
import type { DamFileDownloadLinkBlockData, ExternalLinkBlockData, InternalLinkBlockData } from "@src/blocks.generated";

import type { GQLLinkRedirectQuery, GQLLinkRedirectQueryVariables } from "./redirectToLink.server.generated";

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
 * Redirects to the target of a link document
 */
export async function redirectToLink({
    pageTreeNodeId,
    graphQLFetch,
    pageHeaders,
}: {
    pageTreeNodeId: string;
    graphQLFetch: GraphQLFetch;
    pageHeaders: ResponseInit;
}): Promise<never> {
    const { pageTreeNode } = await graphQLFetch<GQLLinkRedirectQuery, GQLLinkRedirectQueryVariables>(linkRedirectQuery, {
        id: pageTreeNodeId,
    });

    if (pageTreeNode?.document?.__typename === "Link") {
        const content = pageTreeNode.document.content;

        if (content.block?.type === "internal") {
            const link = (content.block.props as InternalLinkBlockData).targetPage?.path;
            if (link) {
                redirect(link, pageHeaders);
            }
        }

        if (content.block?.type === "external") {
            const link = (content.block.props as ExternalLinkBlockData).targetUrl;
            if (link) {
                redirect(link, pageHeaders);
            }
        }

        if (content.block?.type === "damFileDownload") {
            const link = (content.block.props as DamFileDownloadLinkBlockData).file?.fileUrl.replace("/download", "");
            if (link) {
                redirect(link, pageHeaders);
            }
        }
    }

    notFound();
}
