import { gql } from "@dextinity/site-react-router";

export const desktopMenuFragment = gql`
    fragment DesktopMenu on MainMenu {
        items {
            id
            node {
                id
                name
                ...PageLink
                childNodes {
                    id
                    name
                    ...PageLink
                }
            }
        }
    }
`;
