import { gql } from "@dextinity/site-react";

export const topMenuPageTreeNodeFragment = gql`
    fragment TopMenuPageTreeNode on PageTreeNode {
        id
        name
        ...PageLink

        childNodes {
            id
            name
            ...PageLink
        }
    }
`;
