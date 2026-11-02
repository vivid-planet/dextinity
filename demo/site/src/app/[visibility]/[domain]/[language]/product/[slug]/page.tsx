export const dynamic = "error";

import { gql } from "@dextinity/site-nextjs";
import { setServerIntl } from "@dextinity/site-nextjs/server";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { ProductJsonLd, productJsonLdFragment } from "@src/products/ProductJsonLd";
import { createGraphQLFetch } from "@src/util/graphQLClient";
import { loadMessages } from "@src/util/loadMessages";
import { setVisibilityParam } from "@src/util/ServerContext";
import { notFound } from "next/navigation";

import { Content, productDetailContentFragment } from "./Content";
import type { GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables } from "./page.generated";

export default async function ProductDetailPage({ params }: PageProps<"/[visibility]/[domain]/[language]/product/[slug]">) {
    const { domain, language, slug, visibility } = await params;
    setVisibilityParam(visibility as VisibilityParam);
    const scope = { domain, language };
    const graphqlFetch = createGraphQLFetch();

    const data = await graphqlFetch<GQLProductDetailPageQuery, GQLProductDetailPageQueryVariables>(
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

    if (data.productBySlug === null || data.productBySlug.status !== "Published") {
        notFound();
    }

    setServerIntl(language, await loadMessages(language));

    return (
        <>
            <ProductJsonLd product={data.productBySlug} scope={scope} />
            <Content product={data.productBySlug} />
        </>
    );
}
