import { getPreviewScope } from "@dextinity/site-react-router/server";
import { getHostByHeaders, getSiteConfigForHost } from "@src/util/siteConfig";
import { setSiteContext } from "@src/util/siteContext";
import type { MiddlewareFunction } from "react-router";

/**
 * Resolves the site once per request, in the preview by the scope set by `sitePreviewMiddleware`. Leaves the site context unset
 * for unknown hosts, they are handled by `redirectToMainHostMiddleware`.
 */
export const siteContextMiddleware: MiddlewareFunction<Response> = ({ request, context }) => {
    const siteConfig = getSiteConfigForHost(getHostByHeaders(request.headers), getPreviewScope(context));
    if (siteConfig) {
        setSiteContext(context, { domain: siteConfig.scope.domain });
    }
};
