import type { PublicSiteConfig } from "@src/site-configs";

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

export function getSiteConfigForDomain(domain: string) {
    const siteConfig = getSiteConfigs().find((siteConfig) => siteConfig.scope.domain === domain);
    if (!siteConfig) {
        throw new Error(`SiteConfig not found for domain ${domain}`);
    }
    return siteConfig;
}
