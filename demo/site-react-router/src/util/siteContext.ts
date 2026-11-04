import { getSitePreview, getVisibility, type SitePreview, type Visibility } from "@dextinity/site-react-router/server";
import { createContext, type RouterContextProvider } from "react-router";

/** Set by the site context middleware for requests to a known site */
const siteDomainContext = createContext<{ domain?: string }>({});

type SiteContext = {
    domain: string;
    /** From the site preview or the block preview */
    visibility: Visibility;
    /** Set while the site is opened in the site preview of the admin */
    sitePreview?: SitePreview;
};

type ReadonlyRouterContext = Readonly<RouterContextProvider>;

export function setSiteContext(context: ReadonlyRouterContext, { domain }: Pick<SiteContext, "domain">) {
    context.set(siteDomainContext, { domain });
}

export function hasSiteContext(context: ReadonlyRouterContext) {
    return context.get(siteDomainContext).domain !== undefined;
}

export function getSiteContext(context: ReadonlyRouterContext): SiteContext {
    const { domain } = context.get(siteDomainContext);
    if (domain === undefined) {
        throw new Error("Site context is only available for site requests");
    }
    return { domain, visibility: getVisibility(context), sitePreview: getSitePreview(context) };
}
