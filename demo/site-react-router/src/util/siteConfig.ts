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
 * The site of a host, or of the scope of the site preview, which runs on the host of the preview
 */
export function getSiteConfigForHost(host: string, previewScope?: { domain?: string }) {
    if (previewScope?.domain) {
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
