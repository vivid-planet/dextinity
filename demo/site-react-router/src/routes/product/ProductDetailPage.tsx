import { gql } from "@dextinity/site-react";
import { cacheControlHeaders, notFound } from "@dextinity/site-react-router";
import { ProductJsonLd, productJsonLdFragment } from "@src/products/ProductJsonLd";
import { getGraphQLFetch } from "@src/util/graphQLClient.server";
import { getPageHeaders } from "@src/util/pageCacheControl.server";
import { getSiteContext } from "@src/util/siteContext";
import { data } from "react-router";

import type { Route } from "./+types/ProductDetailPage";
import { ProductDetailContent, productDetailContentFragment } from "./ProductDetailContent";
import type { GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables } from "./ProductDetailPage.generated";

export const headers = cacheControlHeaders;

export const meta: Route.MetaFunction = ({ loaderData }) => (loaderData ? [{ title: loaderData.product.title }] : []);

export async function loader({ params, context }: Route.LoaderArgs) {
    const { productBySlug: product } = await getGraphQLFetch(context)<GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables>(
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
        { slug: params.slug },
    );

    if (product === null || product.status !== "Published") {
        notFound();
    }

    return data({ product, scope: { domain: getSiteContext(context).domain, language: params.language } }, getPageHeaders(context));
}

export default function ProductDetailPage({ loaderData: { product, scope } }: Route.ComponentProps) {
    return (
        <>
            <ProductJsonLd product={product} scope={scope} />
            <ProductDetailContent product={product} />
        </>
    );
}
