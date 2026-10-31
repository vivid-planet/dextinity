import { gql } from "@dextinity/site-react";
import { notFound, redirect } from "@dextinity/site-vite-rsc";
import type { ExternalLinkBlockData, InternalLinkBlockData, NewsLinkBlockData, RedirectsLinkBlockData } from "@src/blocks.generated";
import { documentTypes } from "@src/documents";
import type { GQLPageTreeNodeScope } from "@src/graphql.generated";
import type { ContentScope } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { graphQLFetch } from "@src/util/graphQLClient";
import { getSiteConfigForDomain } from "@src/util/siteConfig";

import type { GQLDocumentTypeQuery, GQLDocumentTypeQueryVariables } from "./DocumentPage.generated";

const documentTypeQuery = gql`
    query DocumentType(
        $skipPage: Boolean!
        $path: String!
        $scope: PageTreeNodeScopeInput!
        $redirectSource: String!
        $redirectScope: RedirectScopeInput!
    ) {
        pageTreeNodeByPath(path: $path, scope: $scope) @skip(if: $skipPage) {
            id
            documentType
        }
        redirectBySource(source: $redirectSource, sourceType: path, scope: $redirectScope) {
            target
        }
    }
`;

type Params = ContentScope & { path: string[] };

async function fetchPageTreeNode({ domain, language, path: pathParam }: Params) {
    const siteConfig = getSiteConfigForDomain(domain);

    // Redirects are scoped by domain only, not by language.
    // If the language param isn't a valid language, it may still be the first segment of a redirect source.
    // In that case we skip resolving page and only check if the path is a redirect source.
    const skipPage = !siteConfig.scope.languages.includes(language);

    const path = `/${pathParam.join("/")}`;
    const { scope } = { scope: { domain, language } };
    return graphQLFetch<GQLDocumentTypeQuery, GQLDocumentTypeQueryVariables>(
        documentTypeQuery,
        {
            skipPage,
            path,
            scope,
            redirectSource: `/${language}${path !== "/" ? path : ""}`,
            redirectScope: { domain: scope.domain },
        },
        { method: "GET" }, //for request memoization
    );
}

export async function DocumentPage(params: Params) {
    const { domain, language } = params;
    const scope = { domain, language };
    const data = await fetchPageTreeNode(params);

    if (!data.pageTreeNodeByPath?.documentType) {
        if (data.redirectBySource?.target) {
            const target = data.redirectBySource?.target as RedirectsLinkBlockData;
            let destination: string | undefined;
            if (target.block !== undefined) {
                switch (target.block.type) {
                    case "internal": {
                        const internalLink = target.block.props as InternalLinkBlockData;
                        if (internalLink.targetPage) {
                            destination = createSitePath({
                                path: internalLink.targetPage.path,
                                scope: internalLink.targetPage.scope as GQLPageTreeNodeScope,
                            });
                        }
                        break;
                    }
                    case "external":
                        destination = (target.block.props as ExternalLinkBlockData).targetUrl;
                        break;
                    case "news": {
                        const newsLink = target.block.props as NewsLinkBlockData;
                        if (newsLink.news) {
                            destination = `/${newsLink.news.scope.language}/news/${newsLink.news.slug}`;
                        }
                        break;
                    }
                }
                if (destination) {
                    redirect(destination);
                }
            }
        }
        notFound();
    }

    const pageTreeNodeId = data.pageTreeNodeByPath.id;

    const props = {
        pageTreeNodeId,
        scope,
    };

    const { component: Component } = documentTypes[data.pageTreeNodeByPath.documentType];

    return <Component {...props} />;
}
