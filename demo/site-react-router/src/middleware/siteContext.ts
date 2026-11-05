import { previewParams } from "@dextinity/site-react-router/server";
import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { siteContext, type Visibility } from "@src/util/siteContext";
import type { MiddlewareFunction } from "react-router";

import { redirectToMainHost } from "./redirectToMainHost";

/**
 * Resolves the site of the request from its host, or from the scope of the site preview, and stores it in the `siteContext`.
 * Other hosts are redirected to the main host of their site.
 */
export const siteContextMiddleware: MiddlewareFunction<Response> = async ({ request, context }, next) => {
    const host = getHostByHeaders(request.headers);
    const sitePreview = (await previewParams(request)) ?? undefined;
    const siteConfig = getSiteConfigForHost(host, sitePreview?.scope);

    if (!siteConfig) {
        if (host === process.env.PREVIEW_DOMAIN) {
            return Response.json({ error: "Preview has to be called from within Dextinity Web preview" }, { status: 404 });
        }
        return redirectToMainHost(request, host);
    }

    let visibility: Visibility = "default";
    if (sitePreview?.previewData) {
        visibility = sitePreview.previewData.includeInvisible ? "invisibleBlocks" : "invisiblePages";
    }

    context.set(siteContext, { siteConfig, domain: siteConfig.scope.domain, visibility, sitePreview });
    return next();
};
