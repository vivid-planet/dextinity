import { getRequestContext, type SitePreviewParams } from "@dextinity/site-react-router/server";
import type { PublicSiteConfig } from "@src/site-configs";
import { createContext, type RouterContextProvider } from "react-router";

/**
 * Which content of the API the site shows: the site preview also shows unpublished pages and, if enabled in the admin, invisible blocks
 */
export type Visibility = "default" | "invisiblePages" | "invisibleBlocks";

export type SiteContext = {
    siteConfig: PublicSiteConfig;
    domain: string;
    visibility: Visibility;
    sitePreview?: SitePreviewParams;
};

/**
 * Set by `siteContextMiddleware` for the routes of the site layout, the counterpart of the `[visibility]/[domain]` params of the Next.js site
 */
export const siteContext = createContext<SiteContext>();

/**
 * The site of the request in loaders, actions and middlewares (pass their `context`) and in server components
 */
export function getSiteContext(context: Readonly<RouterContextProvider> = getRequestContext()): SiteContext {
    return context.get(siteContext);
}
