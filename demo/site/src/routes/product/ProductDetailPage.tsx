import { gql } from "@dextinity/site-react";
import { notFound } from "@dextinity/site-vite-rsc";
import { ProductJsonLd, productJsonLdFragment } from "@src/products/ProductJsonLd";
import type { ContentScope } from "@src/site-configs";
import { graphQLFetch } from "@src/util/graphQLClient";

import { ProductDetailContent, productDetailContentFragment } from "./ProductDetailContent";
import type { GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables } from "./ProductDetailPage.generated";

export async function ProductDetailPage({ scope, slug }: { scope: ContentScope; slug: string }) {
    const data = await graphQLFetch<GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables>(
        gql`
            query ProductDetailPage($slug: String!) {
                productBySlug(slug: $slug) {
                    id
                    status
                    ...ProductDetailContent
                    ...ProductJsonLd
                }
            }
            ${productDetailContentFragment}
            ${productJsonLdFragment}
        `,
        { slug },
    );

    if (data.productBySlug === null || data.productBySlug.status !== "Published") {
        notFound();
    }

    return (
        <>
            <title>{data.productBySlug.title}</title>
            <ProductJsonLd product={data.productBySlug} scope={scope} />
            <ProductDetailContent product={data.productBySlug} />
        </>
    );
}
