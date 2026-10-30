import { gql } from "@dextinity/site-nextjs";
import { newsArticleJsonLdFragment } from "@src/news/NewsArticleJsonLd";

export const fragment = gql`
    fragment NewsDetailPage on News {
        ...NewsArticleJsonLd
        createdAt
        content
    }
    ${newsArticleJsonLdFragment}
`;
