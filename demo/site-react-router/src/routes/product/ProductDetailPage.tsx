import { gql } from "@dextinity/site-react-router";
import { ProductDetailContent, productDetailContentFragment } from "@src/products/ProductDetailContent";
import { ProductJsonLd, productJsonLdFragment } from "@src/products/ProductJsonLd";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { getSiteContext } from "@src/util/siteContext";
import { data } from "react-router";

import type { Route } from "./+types/ProductDetailPage";
import type { GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables } from "./ProductDetailPage.generated";

const productDetailPageQuery = gql`
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
`;

export async function loader({ params, context }: Route.LoaderArgs) {
    const scope = { domain: getSiteContext(context).domain, language: params.language };
    const { productBySlug: product } = await createGraphQLFetch(context)<GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables>(
        productDetailPageQuery,
        { slug: params.slug },
    );

    if (product === null || product.status !== "Published") {
        throw data(null, { status: 404 });
    }

    return { scope, product };
}

export const meta: Route.MetaFunction = ({ loaderData }) => [{ title: loaderData?.product.title }];

export function ServerComponent({ loaderData: { scope, product } }: Route.ServerComponentProps) {
    return (
        <>
            <ProductJsonLd product={product} scope={scope} />
            <ProductDetailContent product={product} />
        </>
    );
}
