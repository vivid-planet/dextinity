export const dynamic = "error";

import { gql } from "@dextinity/site-nextjs";
import { setServerIntl } from "@dextinity/site-nextjs/server";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { loadMessages } from "@src/util/loadMessages";
import { setVisibilityParam } from "@src/util/ServerContext";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import NextLink from "next/link";
import { notFound } from "next/navigation";

import { FormattedMessage } from "#intl";

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

export default async function ProductListPage({ params }: PageProps<"/[visibility]/[domain]/[language]/product">) {
    const { domain, language, visibility } = await params;
    setVisibilityParam(visibility as VisibilityParam);
    if (!getSiteConfigForDomain(domain).scope.languages.includes(language)) {
        notFound();
    }
    setServerIntl(language, await loadMessages(language));
    const products = await fetchAllPublishedProducts();

    return (
        <div>
            <h1>
                <FormattedMessage id="productListPage.title" defaultMessage="Products" />
            </h1>
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
