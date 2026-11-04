import { sitePreviewRoute } from "@dextinity/site-react-router/server";
import { contentSecurityPolicyHeadersMiddleware } from "@src/middleware/contentSecurityPolicyHeaders";

import type { Route } from "./+types/sitePreviewRoute";

export const middleware: Route.MiddlewareFunction[] = [contentSecurityPolicyHeadersMiddleware];

/**
 * Starts the site preview of the admin, see `PREVIEW_URL` of the admin
 */
export function loader({ request }: Route.LoaderArgs) {
    return sitePreviewRoute(request);
}
