import { gql } from "@dextinity/site-react";
import { notFound } from "@src/framework/navigation";
import { createGraphQLFetch } from "@src/util/graphQLClient";

import { Content, productDetailContentFragment } from "./Content";
import type { GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables } from "./page.generated";

export default async function ProductDetailPage({ slug }: { slug: string }) {
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

    return (
        <>
            <title>{data.productBySlug.title}</title>
            <Content product={data.productBySlug} />
        </>
    );
}
