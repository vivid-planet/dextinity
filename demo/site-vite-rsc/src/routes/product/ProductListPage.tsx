import { gql } from "@dextinity/site-react";
import { Link } from "@dextinity/site-vite-rsc";
import { createSitePath } from "@src/util/createSitePath";
import { graphQLFetch } from "@src/util/graphQLClient";
import { Suspense } from "react";

import type { GQLProductListPageQuery, GQLProductListPageQueryVariables } from "./ProductListPage.generated";

const productsPerRequest = 100;

async function fetchAllPublishedProducts() {
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

async function ProductList({ language }: { language: string }) {
    const products = await fetchAllPublishedProducts();

    return (
        <ul>
            {products.map((product) => (
                <li key={product.id}>
                    <Link href={createSitePath({ path: `/product/${product.slug}`, scope: { language } })}>{product.title}</Link>
                </li>
            ))}
        </ul>
    );
}

export function ProductListPage({ language }: { language: string }) {
    return (
        <div>
            <title>Products</title>
            <h1>Products</h1>
            {/* Loads all pages of products, streamed responses show the page before it */}
            <Suspense>
                <ProductList language={language} />
            </Suspense>
        </div>
    );
}
