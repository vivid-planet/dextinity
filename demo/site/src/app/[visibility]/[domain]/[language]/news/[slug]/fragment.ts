import { gql } from "@dextinity/site-nextjs";
import { newsArticleStructuredDataFragment } from "@src/util/structuredData/buildArticle";

export const fragment = gql`
    fragment NewsDetailPage on News {
        ...NewsArticleStructuredData
        createdAt
        content
    }
    ${newsArticleStructuredDataFragment}
`;
