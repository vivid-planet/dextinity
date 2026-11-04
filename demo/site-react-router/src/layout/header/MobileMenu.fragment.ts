import { gql } from "@dextinity/site-react-router";

export const mobileMenuFragment = gql`
    fragment MobileMenu on MainMenu {
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
