export const dynamic = "error";

import { gql } from "@dextinity/site-nextjs";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { setVisibilityParam } from "@src/util/ServerContext";
import { notFound } from "next/navigation";

import { Content, productDetailContentFragment } from "./Content";
import type { GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables } from "./page.generated";

export default async function ProductDetailPage({ params }: PageProps<"/[visibility]/[domain]/[language]/product/[slug]">) {
    const { slug, visibility } = await params;
    setVisibilityParam(visibility as VisibilityParam);
    const graphqlFetch = createGraphQLFetch();

    const data = await graphqlFetch<GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables>(
        gql`
            query ProductDetailPage($slug: String!) {
                productBySlug(slug: $slug) {
                    id
                    status
                    ...ProductDetailContent
                }
            }
            ${productDetailContentFragment}
        `,
        { slug },
    );

    if (data.productBySlug === null || data.productBySlug.status !== "Published") {
        notFound();
    }

    return <Content product={data.productBySlug} />;
}
