import { previewParams } from "@dextinity/site-nextjs/server";
import { headers } from "next/headers";

import { getSiteConfigs } from "./getSiteConfigs";

export { getSiteConfigForDomain, getSiteConfigs } from "./getSiteConfigs";

export function getHostByHeaders(headers: Headers) {
    const host = headers.get("x-forwarded-host") ?? headers.get("host");
    if (!host) {
        throw new Error("Could not evaluate host");
    }
    return host;
}

export async function getSiteConfigForHost(host: string) {
    const sitePreviewParams = await previewParams({ skipDraftModeCheck: true });
    if (sitePreviewParams?.scope) {
        const siteConfig = getSiteConfigs().find((siteConfig) => siteConfig.scope.domain === sitePreviewParams.scope.domain);
        if (siteConfig) {
            return siteConfig;
        }
    }
    return getSiteConfigs().find((siteConfig) => siteConfig.domains.main === host || siteConfig.domains.preliminary === host);
}

// Used for getting SiteConfig in server-components where params is not available (e.g. sitemap, not-found - see https://github.com/vercel/next.js/discussions/43179)
export async function getSiteConfig() {
    const host = getHostByHeaders(await headers());
    const siteConfig = await getSiteConfigForHost(host);
    if (!siteConfig) {
        throw new Error(`SiteConfig not found for host ${host}`);
    }
    return siteConfig;
}
