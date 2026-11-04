import { gql, type GraphQLFetch } from "@dextinity/site-react";
import { cacheControlHeaders } from "@dextinity/site-react-router";
import { createSitePath } from "@src/util/createSitePath";
import { getGraphQLFetch } from "@src/util/graphQLClient.server";
import { getPageHeaders } from "@src/util/pageCacheControl.server";
import { data, Link } from "react-router";

import type { Route } from "./+types/ProductListPage";
import type { GQLProductListPageQuery, GQLProductListPageQueryVariables } from "./ProductListPage.generated";

const productsPerRequest = 100;

async function fetchAllPublishedProducts(graphQLFetch: GraphQLFetch) {
    const products: GQLProductListPageQuery["products"]["nodes"] = [];
    let hasMoreProducts: boolean;

    do {
        const data = await graphQLFetch<GQLProductListPageQuery, GQLProductListPageQueryVariables>(
            gql`
                query ProductListPage($offset: Int!, $limit: Int!) {
                    products(
                        filter: { status: { equal: Published } }
                        sort: [{ field: title, direction: ASC }, { field: id, direction: ASC }]
                        offset: $offset
                        limit: $limit
                    ) {
                        nodes {
                            id
                            title
                            slug
                        }
                    }
                }
            `,
            { offset: products.length, limit: productsPerRequest },
        );
        products.push(...data.products.nodes);
        hasMoreProducts = data.products.nodes.length === productsPerRequest;
    } while (hasMoreProducts);

    return products;
}

export const headers = cacheControlHeaders;

export const meta: Route.MetaFunction = () => [{ title: "Products" }];

export async function loader({ context }: Route.LoaderArgs) {
    return data({ products: await fetchAllPublishedProducts(getGraphQLFetch(context)) }, getPageHeaders(context));
}

export default function ProductListPage({ loaderData: { products }, params: { language } }: Route.ComponentProps) {
    return (
        <div>
            <h1>Products</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <Link to={createSitePath({ path: `/product/${product.slug}`, scope: { language } })}>{product.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
