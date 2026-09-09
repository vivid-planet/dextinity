import { gql } from "@dextinity/site-nextjs";

export const fragment = gql`
    fragment NewsDetailPage on News {
        title
        image
        date
        createdAt
        updatedAt
        slug
        content
    }
`;
