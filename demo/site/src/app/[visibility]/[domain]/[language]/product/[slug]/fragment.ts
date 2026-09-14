import { gql } from "@dextinity/site-nextjs";
import { productJsonLdFragment } from "@src/products/ProductJsonLd";

export const fragment = gql`
    fragment ProductDetailPage on Product {
        ...ProductJsonLd
    }
    ${productJsonLdFragment}
`;
