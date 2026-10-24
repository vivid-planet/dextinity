import { gql } from "@dextinity/site-react";
import { newsArticleJsonLdFragment } from "@src/news/NewsArticleJsonLd";

export const fragment = gql`
    fragment NewsDetailPage on News {
        ...NewsArticleJsonLd
        createdAt
        content
    }
    ${newsArticleJsonLdFragment}
`;
