import { gql } from "@dextinity/site-nextjs";

export const pageLinkFragment = gql`
    fragment PageLink on PageTreeNode {
        path
        documentType
        scope {
            language
        }
        document {
            __typename
            ... on Link {
                content
            }
        }
    }
`;
