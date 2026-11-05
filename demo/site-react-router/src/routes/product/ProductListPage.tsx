import { gql, type GraphQLFetch } from "@dextinity/site-react-router";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { Link } from "react-router";

import type { Route } from "./+types/ProductListPage";
import type { GQLProductListPageQuery, GQLProductListPageQueryVariables } from "./ProductListPage.generated";

const productsPerRequest = 100;

const productListPageQuery = gql`
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
`;

async function fetchAllPublishedProducts(graphQLFetch: GraphQLFetch) {
    const products: GQLProductListPageQuery["products"]["nodes"] = [];
    let hasMoreProducts: boolean;

    do {
        const data = await graphQLFetch<GQLProductListPageQuery, GQLProductListPageQueryVariables>(productListPageQuery, {
            offset: products.length,
            limit: productsPerRequest,
        });
        products.push(...data.products.nodes);
        hasMoreProducts = data.products.nodes.length === productsPerRequest;
    } while (hasMoreProducts);

    return products;
}

export async function loader({ params, context }: Route.LoaderArgs) {
    return { language: params.language, products: await fetchAllPublishedProducts(createGraphQLFetch(context)) };
}

export const meta: Route.MetaFunction = () => [{ title: "Products" }];

export function ServerComponent({ loaderData: { language, products } }: Route.ServerComponentProps) {
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
