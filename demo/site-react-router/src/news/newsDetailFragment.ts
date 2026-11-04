import { gql } from "@dextinity/site-react-router";
import { newsArticleJsonLdFragment } from "@src/news/NewsArticleJsonLd";

export const newsDetailFragment = gql`
    fragment NewsDetailPage on News {
        ...NewsArticleJsonLd
        createdAt
        content
    }
    ${newsArticleJsonLdFragment}
`;
