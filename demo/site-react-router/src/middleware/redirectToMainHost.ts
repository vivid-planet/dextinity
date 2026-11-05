import { gql } from "@dextinity/site-react-router";
import type { ExternalLinkBlockData, InternalLinkBlockData, NewsLinkBlockData, RedirectsLinkBlockData } from "@src/blocks.generated";
import type { GQLPageTreeNodeScope, GQLRedirectScopeInput } from "@src/graphql.generated";
import type { PublicSiteConfig } from "@src/site-configs";
import { createSitePath } from "@src/util/createSitePath";
import { createGraphQLFetchMiddleware } from "@src/util/graphQLClientMiddleware";
import { getSiteConfigs } from "@src/util/siteConfig";
import { redirect } from "react-router";

import { memoryCache } from "./cache";
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
                filter: { sourceType: { equal: "domain" }, active: { equal: true } },
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

/**
 * Redirects a host that isn't the main host of a site, e.g. an additional domain or a domain redirect of the CMS
 *
 * @returns The redirect, or a 404 response if the host doesn't belong to any site
 */
export async function redirectToMainHost(request: Request, host: string): Promise<Response> {
    const url = new URL(request.url);
    const redirectSiteConfig =
        getSiteConfigs().find((siteConfig) => matchesHostWithAdditionalDomain(siteConfig, host)) ||
        getSiteConfigs().find((siteConfig) => matchesHostWithPattern(siteConfig, host));

    if (redirectSiteConfig) {
        const { scope } = redirectSiteConfig;

        const domainRedirects = await fetchDomainRedirects(scope);

        const domainRedirect = domainRedirects.find((domainRedirect) => normalizeHost(domainRedirect.source) === normalizeHost(host));

        if (domainRedirect) {
            const destination = getRedirectTargetUrl(domainRedirect.target.block, `https://${redirectSiteConfig.domains.main}`);
            if (destination) {
                if (normalizeHost(new URL(destination, request.url).host) === normalizeHost(host)) {
                    throw new Error(`Redirect loop detected: ${host} -> ${destination}`);
                }
                return redirect(new URL(destination, request.url).toString(), 301);
            }
        }
        // Redirect to Main Host
        const mainHost = normalizeHost(redirectSiteConfig.domains.main);
        if (mainHost === normalizeHost(host)) {
            throw new Error(`Redirect loop detected: main host ${mainHost} equals current host`);
        }
        return redirect(`https://${redirectSiteConfig.domains.main}${url.pathname}${url.search}`, 301);
    }

    const domainRedirects = await fetchDomainRedirectsForAllScopes();

    const domainRedirect = domainRedirects.find((domainRedirect) => normalizeHost(domainRedirect.source) === normalizeHost(host));
    if (domainRedirect) {
        const scopedSiteConfig = getSiteConfigs().find((config) => config.scope.domain === domainRedirect.scope.domain);

        if (!scopedSiteConfig) {
            throw new Error(`Got redirect to domain ${domainRedirect.scope.domain}, but couldn't find corresponding site-config.`);
        }

        const destination = getRedirectTargetUrl(domainRedirect.target.block, `https://${scopedSiteConfig.domains.main}`);

        if (destination) {
            if (normalizeHost(new URL(destination, request.url).host) === normalizeHost(host)) {
                throw new Error(`Redirect loop detected: ${host} -> ${destination}`);
            }
            return redirect(new URL(destination, request.url).toString(), 301);
        }
    }

    return Response.json({ error: `Cannot resolve domain: ${host}` }, { status: 404 });
}
