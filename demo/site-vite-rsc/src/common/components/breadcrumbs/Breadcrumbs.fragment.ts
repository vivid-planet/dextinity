import { gql } from "@dextinity/site-react";

export const breadcrumbsFragment = gql`
    fragment Breadcrumbs on PageTreeNode {
        name
        path
        parentNodes {
            name
            path
        }
        scope {
            language
        }
    }
`;
