import { gql } from "@dextinity/site-nextjs";

import { newsArticleJsonLdFragment } from "./NewsArticleJsonLd";

export const newsDetailFragment = gql`
    fragment NewsDetail on News {
        ...NewsArticleJsonLd
        createdAt
        content
    }
    ${newsArticleJsonLdFragment}
`;
