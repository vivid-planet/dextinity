import { getRequest } from "@src/framework/requestContext";
import type { PublicSiteConfig } from "@src/site-configs";

import { getPreviewParams } from "./sitePreview";

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

export async function getSiteConfigForHost(host: string) {
    const sitePreviewParams = await getPreviewParams({ checkBlockPreviewHeader: true });
    if (sitePreviewParams?.scope) {
        const siteConfig = getSiteConfigs().find((siteConfig) => siteConfig.scope.domain === sitePreviewParams.scope.domain);
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

// Used for getting SiteConfig where the domain param is not available (e.g. robots.txt)
export async function getSiteConfig() {
    const host = getHostByHeaders(getRequest().headers);
    const siteConfig = await getSiteConfigForHost(host);
    if (!siteConfig) {
        throw new Error(`SiteConfig not found for host ${host}`);
    }
    return siteConfig;
}
