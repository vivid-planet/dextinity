import { gql, type GraphQLFetch } from "@dextinity/site-react";
import { cacheControlHeaders, notFound } from "@dextinity/site-react-router";
import { ProductJsonLd, productJsonLdFragment } from "@src/products/ProductJsonLd";
import { getGraphQLFetch, graphQLFetch } from "@src/util/graphQLClient";
import { getPageHeaders } from "@src/util/pageCacheControl";
import { getSiteContext } from "@src/util/siteContext";
import { data } from "react-router";

import type { Route } from "./+types/ProductDetailPage";
import { ProductDetailContent, productDetailContentFragment } from "./ProductDetailContent";
import type { GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables } from "./ProductDetailPage.generated";

/**
 * The published product, the loader checks that it exists, the server component gets it from the same request without querying it again
 */
async function fetchProduct({ slug, graphQLFetch }: { slug: string; graphQLFetch: GraphQLFetch }) {
    const { productBySlug: product } = await graphQLFetch<GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables>(
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

    if (product === null || product.status !== "Published") {
        notFound();
    }
    return product;
}

export const headers = cacheControlHeaders;

export const meta: Route.MetaFunction = ({ loaderData }) => (loaderData ? [{ title: loaderData.title }] : []);

export async function loader({ params, context }: Route.LoaderArgs) {
    const product = await fetchProduct({ slug: params.slug, graphQLFetch: getGraphQLFetch(context) });
    return data({ scope: { domain: getSiteContext(context).domain, language: params.language }, title: product.title }, getPageHeaders(context));
}

export async function ServerComponent({ loaderData: { scope }, params }: Route.ServerComponentProps) {
    const product = await fetchProduct({ slug: params.slug, graphQLFetch });

    return (
        <>
            <ProductJsonLd product={product} scope={scope} />
            <ProductDetailContent product={product} />
        </>
    );
}
