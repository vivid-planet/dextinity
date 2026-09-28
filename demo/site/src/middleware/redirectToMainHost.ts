import { gql } from "@dextinity/site-nextjs";
import type { ExternalLinkBlockData, InternalLinkBlockData, NewsLinkBlockData, RedirectsLinkBlockData } from "@src/blocks.generated";
import type { GQLPageTreeNodeScope, GQLRedirectScopeInput } from "@src/graphql.generated";
import type { PublicSiteConfig } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetchMiddleware } from "@src/util/graphQLClientMiddleware";
import { getHostByHeaders, getSiteConfigForHost, getSiteConfigs } from "@src/util/siteConfig";
import { type NextRequest, NextResponse } from "next/server";

import { memoryCache } from "./cache";
import type { CustomMiddleware } from "./chain";
import type { GQLDomainRedirectsQuery, GQLDomainRedirectsQueryVariables } from "./redirectToMainHost.generated";

const domainRedirectsQuery = gql`
    query DomainRedirects($scope: RedirectScopeInput!, $filter: RedirectFilter, $offset: Int, $limit: Int) {
        paginatedRedirects(scope: $scope, filter: $filter, offset: $offset, limit: $limit) {
            nodes {
                id
                source
                target
                sourceType
                scope {
                    domain
                }
            }
            totalCount
        }
    }
`;

const graphQLFetch = createGraphQLFetchMiddleware();

type Redirect = GQLDomainRedirectsQuery["paginatedRedirects"]["nodes"][number];

async function fetchDomainRedirects(scope: GQLRedirectScopeInput) {
    const key = `domainRedirects-${scope.domain}`;
    return memoryCache.wrap(key, async () => {
        const limit = 50;

        let allNodes: Redirect[] = [];
        let totalCount = 0;
        let currentCount = 0;
        do {
            const data = await graphQLFetch<GQLDomainRedirectsQuery, GQLDomainRedirectsQueryVariables>(domainRedirectsQuery, {
                scope: { domain: scope.domain },
                filter: { sourceType: { equal: "domain" } },
                offset: currentCount,
                limit,
            });
            const nodes = data?.paginatedRedirects?.nodes || [];
            totalCount = data?.paginatedRedirects?.totalCount || 0;
            currentCount += nodes.length;
            allNodes = allNodes.concat(nodes);
        } while (currentCount < totalCount);
        return allNodes;
    });
}

async function fetchDomainRedirectsForAllScopes() {
    return (await Promise.all(getSiteConfigs().map((config) => fetchDomainRedirects(config.scope)))).flat();
}

function normalizeHost(value: string): string {
    return value.replace(/^https?:\/\//, "");
}

const normalizeDomain = (host: string) => (host.startsWith("www.") ? host.substring(4) : host);

const matchesHostWithAdditionalDomain = (siteConfig: PublicSiteConfig, host: string) => {
    if (normalizeDomain(siteConfig.domains.main) === normalizeDomain(host)) {
        return true; // non-www redirect
    }
    if (siteConfig.domains.additional?.map(normalizeDomain).includes(normalizeDomain(host))) {
        return true;
    }
    return false;
};

const matchesHostWithPattern = (siteConfig: PublicSiteConfig, host: string) => {
    if (!siteConfig.domains.pattern) {
        return false;
    }
    return new RegExp(siteConfig.domains.pattern).test(host);
};

function getRedirectTargetUrl(block: RedirectsLinkBlockData["block"], targetBaseUrl: string): string | undefined {
    if (!block) {
        return undefined;
    }
    switch (block.type) {
        case "internal": {
            const internalLink = block.props as InternalLinkBlockData;
            if (internalLink.targetPage) {
                return `${targetBaseUrl}${createSitePath({
                    path: internalLink.targetPage.path,
                    scope: internalLink.targetPage.scope as GQLPageTreeNodeScope,
                })}`;
            }
            break;
        }
        case "external":
            return (block.props as ExternalLinkBlockData).targetUrl;
        case "news": {
            const newsLink = block.props as NewsLinkBlockData;
            if (newsLink.news) {
                return createSitePath({
                    path: `/news/${newsLink.news.slug}`,
                    scope: newsLink.news.scope,
                });
            }
            break;
        }
    }
    return undefined;
}

export function withRedirectToMainHostMiddleware(middleware: CustomMiddleware) {
    return async (request: NextRequest) => {
        const headers = request.headers;
        const host = getHostByHeaders(headers);
        const siteConfig = await getSiteConfigForHost(host);

        if (!siteConfig) {
            const redirectSiteConfig =
                getSiteConfigs().find((siteConfig) => matchesHostWithAdditionalDomain(siteConfig, host)) ||
                getSiteConfigs().find((siteConfig) => matchesHostWithPattern(siteConfig, host));

            if (redirectSiteConfig) {
                const { scope } = redirectSiteConfig;

                const domainRedirects = await fetchDomainRedirects(scope);

                const redirect = domainRedirects.find((redirect) => normalizeHost(redirect.source) === normalizeHost(host));

                if (redirect) {
                    const destination = getRedirectTargetUrl(redirect.target.block, `https://${redirectSiteConfig.domains.main}`);
                    if (destination) {
                        if (normalizeHost(new URL(destination).host) === normalizeHost(host)) {
                            throw new Error(`Redirect loop detected: ${host} -> ${destination}`);
                        }
                        return NextResponse.redirect(destination, { status: 301 });
                    }
                }
                // Redirect to Main Host
                const mainHost = normalizeHost(redirectSiteConfig.domains.main);
                if (mainHost === normalizeHost(host)) {
                    throw new Error(`Redirect loop detected: main host ${mainHost} equals current host`);
                } else {
                    return NextResponse.redirect(`https://${redirectSiteConfig.domains.main}${request.nextUrl.pathname}${request.nextUrl.search}`, {
                        status: 301,
                    });
                }
            }

            const domainRedirects = await fetchDomainRedirectsForAllScopes();

            const redirect = domainRedirects.find((redirect) => normalizeHost(redirect.source) === normalizeHost(host));
            if (redirect) {
                const scopedSiteConfig = getSiteConfigs().find((config) => config.scope.domain === redirect.scope.domain);

                if (!scopedSiteConfig) {
                    throw new Error(`Got redirect to domain ${redirect.scope.domain}, but couldn't find corresponding site-config.`);
                }

                const destination = getRedirectTargetUrl(redirect.target.block, `https://${scopedSiteConfig.domains.main}`);

                if (destination) {
                    if (normalizeHost(new URL(destination).host) === normalizeHost(host)) {
                        throw new Error(`Redirect loop detected: ${host} -> ${destination}`);
                    }
                    return NextResponse.redirect(destination, { status: 301 });
                }
            }

            return NextResponse.json({ error: `Cannot resolve domain: ${host}` }, { status: 404 });
        }
        return middleware(request);
    };
}
