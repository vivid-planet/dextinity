import { gql } from "@dextinity/site-nextjs";

import { desktopMenuFragment } from "./DesktopMenu.fragment";
import { mobileMenuFragment } from "./MobileMenu.fragment";
import { pageLinkFragment } from "./PageLink.fragment";

export const headerFragment = gql`
    fragment Header on MainMenu {
        ...DesktopMenu
        ...MobileMenu
    }
    ${desktopMenuFragment}
    ${mobileMenuFragment}
    ${pageLinkFragment}
`;
