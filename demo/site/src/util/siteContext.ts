import {
    getRequestData,
    getSitePreview,
    getVisibility,
    setPreview,
    setRequestData,
    type SitePreview,
    type Visibility,
} from "@dextinity/site-vite-rsc/server";

declare module "@dextinity/site-vite-rsc/server" {
    interface RequestContextData {
        /** Set by the site context middleware for requests to a known site */
        domain: string;
    }
}

type SiteContext = {
    domain: string;
    /** From the site preview or the block preview */
    visibility: Visibility;
    /** Set while the site is opened in the site preview of the admin */
    sitePreview?: SitePreview;
};

export function setSiteContext({ domain, visibility, sitePreview }: SiteContext) {
    setRequestData("domain", domain);
    setPreview({ visibility, sitePreview });
}

export function hasSiteContext() {
    return getRequestData("domain") !== undefined;
}

export function getSiteContext(): SiteContext {
    const domain = getRequestData("domain");
    if (domain === undefined) {
        throw new Error("Site context is only available for site requests");
    }
    return { domain, visibility: getVisibility(), sitePreview: getSitePreview() };
}
