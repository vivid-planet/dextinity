export const dynamic = "error";

import { gql } from "@dextinity/site-nextjs";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { setVisibilityParam } from "@src/util/ServerContext";
import NextLink from "next/link";

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
                    products(filter: { status: { equal: Published } }, sort: [{ field: title, direction: ASC }], offset: $offset, limit: $limit) {
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

export default async function ProductListPage({ params }: PageProps<"/[visibility]/[domain]/[language]/product">) {
    const { language, visibility } = await params;
    setVisibilityParam(visibility as VisibilityParam);
    const products = await fetchAllPublishedProducts();

    return (
        <div>
            <h1>Products</h1>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <NextLink href={createSitePath({ path: `/product/${product.slug}`, scope: { language } })}>{product.title}</NextLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}
