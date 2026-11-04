import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    route("site-preview", "routes/sitePreviewRoute.ts"),
    route("sitemap.xml", "routes/sitemapRoute.ts"),
    layout("routes/PreviewLayout.tsx", [
        layout("routes/PageErrorBoundary.tsx", [
            index("routes/HomePage.tsx"),
            route("cached", "routes/CachedPage.tsx"),
            route("not-found", "routes/NotFoundPage.tsx"),
            route("server-error", "routes/ServerErrorPage.tsx"),
            route("redirect", "routes/RedirectPage.tsx"),
            route("unsafe-redirect", "routes/UnsafeRedirectPage.tsx"),
            route("render-error", "routes/RenderErrorPage.tsx"),
            route("request-context", "routes/RequestContextPage.tsx"),
            route("cdn/page", "routes/CdnPage.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
