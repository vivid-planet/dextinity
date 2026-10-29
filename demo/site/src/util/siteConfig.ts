import type { PublicSiteConfig } from "@src/site-configs";

export function getHostByHeaders(headers: Headers) {
    const host = headers.get("x-forwarded-host") ?? headers.get("host");
    if (!host) {
        throw new Error("Could not evaluate host");
    }
    return host;
}

export function getSiteConfigForDomain(domain: string) {
    const siteConfig = getSiteConfigs().find((siteConfig) => siteConfig.scope.domain === domain);
    if (!siteConfig) {
        throw new Error(`SiteConfig not found for domain ${domain}`);
    }
    return siteConfig;
}

/**
 * @param previewScope In the preview, the site is defined by the scope of the preview instead of the host
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSiteConfigForHost(host: string, previewScope?: Record<string, any>) {
    if (previewScope) {
        const siteConfig = getSiteConfigs().find((siteConfig) => siteConfig.scope.domain === previewScope.domain);
        if (siteConfig) {
            return siteConfig;
        }
    }
    return getSiteConfigs().find((siteConfig) => siteConfig.domains.main === host || siteConfig.domains.preliminary === host);
}

let siteConfigs: PublicSiteConfig[];
export function getSiteConfigs() {
    if (!siteConfigs) {
        const json = process.env.PUBLIC_SITE_CONFIGS;
        if (!json) {
            throw new Error("process.env.PUBLIC_SITE_CONFIGS must be set.");
        }
        siteConfigs = JSON.parse(atob(json)) as PublicSiteConfig[];
    }
    return siteConfigs;
}
