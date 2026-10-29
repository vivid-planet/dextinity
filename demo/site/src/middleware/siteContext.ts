import type { Visibility } from "@dextinity/site-vite-rsc/server";
import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { setSiteContext } from "@src/util/siteContext";
import { getPreviewParams } from "@src/util/sitePreview";
import { createMiddleware } from "hono/factory";

/**
 * Resolves the site and the preview once per request. Leaves the site context unset for unknown hosts, they are
 * handled by `redirectToMainHostMiddleware`.
 */
export const siteContextMiddleware = createMiddleware(async (c, next) => {
    const preview = await getPreviewParams({ checkBlockPreviewHeader: true });
    const siteConfig = getSiteConfigForHost(getHostByHeaders(c.req.raw.headers), preview);

    if (siteConfig) {
        let visibility: Visibility = "default";
        if (preview?.previewData) {
            visibility = preview.previewData.includeInvisible ? "invisibleBlocks" : "invisiblePages";
        }
        // The block preview header only sets the visibility, the site preview is identified by its cookie
        const sitePreview = c.req.header("x-block-preview") ? await getPreviewParams() : preview;

        setSiteContext({ domain: siteConfig.scope.domain, visibility, sitePreview: sitePreview ?? undefined });
    }

    await next();
});
