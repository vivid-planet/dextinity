import { gql } from "@dextinity/site-nextjs";

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
