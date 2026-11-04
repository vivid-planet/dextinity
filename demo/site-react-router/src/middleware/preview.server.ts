import { getHostByHeaders } from "@src/util/siteConfig.server";
import { hasSiteContext } from "@src/util/siteContext";
import type { MiddlewareFunction } from "react-router";

export const previewDomainMiddleware: MiddlewareFunction<Response> = ({ request, context }) => {
    // Check if scope has been set via the site-preview api url
    if (getHostByHeaders(request.headers) === process.env.PREVIEW_DOMAIN && !hasSiteContext(context)) {
        return Response.json({ error: "Preview has to be called from within Dextinity Web preview" }, { status: 404 });
    }
};
