import { gql } from "@dextinity/site-nextjs";

export const footerFragment = gql`
    fragment Footer on Footer {
        content
    }
`;
