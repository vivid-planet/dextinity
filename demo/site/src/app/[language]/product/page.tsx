import { gql } from "@dextinity/site-react";
import { Link } from "@src/framework/Link";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetch } from "@src/util/graphQLClient";

import type { GQLProductListPageQuery, GQLProductListPageQueryVariables } from "./page.generated";

const productsPerRequest = 100;

async function fetchAllPublishedProducts() {
    const graphqlFetch = createGraphQLFetch();
    const products: GQLProductListPageQuery["products"]["nodes"] = [];
    let hasMoreProducts: boolean;

    do {
        const data = await graphqlFetch<GQLProductListPageQuery, GQLProductListPageQueryVariables>(
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

export default async function ProductListPage({ language }: { language: string }) {
    const products = await fetchAllPublishedProducts();

    return (
        <div>
            <title>Products</title>
            <h1>Products</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <Link href={createSitePath({ path: `/product/${product.slug}`, scope: { language } })}>{product.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
