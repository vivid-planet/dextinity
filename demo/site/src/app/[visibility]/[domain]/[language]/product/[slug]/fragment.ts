import { gql } from "@dextinity/site-nextjs";

export const fragment = gql`
    fragment ProductDetailPage on Product {
        title
        image
        description
    }
`;
