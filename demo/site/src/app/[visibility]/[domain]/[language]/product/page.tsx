export const dynamic = "error";

import { gql } from "@dextinity/site-nextjs";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { setVisibilityParam } from "@src/util/ServerContext";
import NextLink from "next/link";

import type { GQLProductListPageQuery, GQLProductListPageQueryVariables } from "./page.generated";

export default async function ProductListPage({ params }: PageProps<"/[visibility]/[domain]/[language]/product">) {
    const { language, visibility } = await params;
    setVisibilityParam(visibility as VisibilityParam);
    const graphqlFetch = createGraphQLFetch();

    const data = await graphqlFetch<GQLProductListPageQuery, GQLProductListPageQueryVariables>(gql`
        query ProductListPage {
            products(filter: { status: { equal: Published } }, sort: [{ field: title, direction: ASC }]) {
                nodes {
                    id
                    title
                    slug
                }
            }
        }
    `);

    return (
        <div>
            <h1>Products</h1>
            <ul>
                {data.products.nodes.map((product) => (
                    <li key={product.id}>
                        <NextLink href={createSitePath({ path: `/product/${product.slug}`, scope: { language } })}>{product.title}</NextLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}
