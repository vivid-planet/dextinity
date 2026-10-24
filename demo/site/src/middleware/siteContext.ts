import { setSiteContext, type Visibility } from "@src/framework/requestContext";
import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { getPreviewParams } from "@src/util/sitePreview";
import { createMiddleware } from "hono/factory";

export const siteContextMiddleware = createMiddleware(async (c, next) => {
    const host = getHostByHeaders(c.req.raw.headers);
    const siteConfig = await getSiteConfigForHost(host);
    if (!siteConfig) {
        throw new Error(`Cannot get siteConfig for host ${host}`);
    }

    const preview = await getPreviewParams({ checkBlockPreviewHeader: true });
    let visibility: Visibility = "default";
    if (preview?.previewData) {
        visibility = preview.previewData.includeInvisible ? "invisibleBlocks" : "invisiblePages";
    }

    setSiteContext({ domain: siteConfig.scope.domain, visibility });

    await next();
});
