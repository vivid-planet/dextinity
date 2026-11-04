import { getVisibility, sitemapResponse, sitePreviewMiddleware } from "@dextinity/site-react-router/server";

import type { Route } from "./+types/sitemapRoute";

export const middleware: Route.MiddlewareFunction[] = [sitePreviewMiddleware];

export function loader({ context }: Route.LoaderArgs) {
    return sitemapResponse([{ url: "https://www.example.com/" }], { isPreview: getVisibility(context) !== "default" });
}
