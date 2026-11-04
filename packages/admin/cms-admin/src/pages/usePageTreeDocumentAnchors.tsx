import { gql, useQuery } from "@apollo/client";

import type { GQLPageQuery, GQLPageQueryVariables } from "../documents/types";
import { useLocalPageTreeNodeAnchors } from "./LocalPageTreeNodeDocumentAnchors";
import { usePageTreeConfig } from "./pageTreeConfig";

// Noop query to prevent useQuery from crashing, will never be queries
const noopQuery = gql`
    query PageTreeNodeDocumentAnchorsNoop($id: ID!) {
        pageTreeNode(id: $id) {
            id
        }
    }
`;

function usePageTreeNodeDocumentAnchors(pageTreeNode: { id: string; documentType: string } | null | undefined): string[] | undefined {
    const { documentTypes } = usePageTreeConfig();
    const localAnchors = useLocalPageTreeNodeAnchors();

    const shouldFetchRemoteAnchors =
        pageTreeNode != null && documentTypes[pageTreeNode.documentType]?.getQuery !== undefined && localAnchors[pageTreeNode.id] === undefined;

    const { data } = useQuery<GQLPageQuery, GQLPageQueryVariables>(
        shouldFetchRemoteAnchors
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              documentTypes[pageTreeNode.documentType].getQuery!
            : noopQuery,
        shouldFetchRemoteAnchors ? { variables: { id: pageTreeNode.id } } : { skip: true },
    );

    if (pageTreeNode == null) {
        return undefined;
    }

    if (localAnchors[pageTreeNode.id] !== undefined) {
        return localAnchors[pageTreeNode.id];
    }

    const document = documentTypes[pageTreeNode.documentType];

    if (document === undefined) {
        console.error(`Unknown document type "${pageTreeNode.documentType}"`);
        return undefined;
    }

    if (data?.page?.document == null) {
        return undefined;
    }

    return Array.from(new Set(document.anchors(data.page.document)));
}

export { usePageTreeNodeDocumentAnchors };
