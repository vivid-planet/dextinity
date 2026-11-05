import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    route("site-preview", "routes/sitePreviewRoute.ts"),
    route("robots.txt", "routes/robotsRoute.ts"),
    route("sitemap.xml", "routes/sitemapRoute.ts"),
    route("api/counter", "routes/counterRoute.ts"),
    route("image/*", "routes/imageRoute.ts"),
    route("dam/*", "routes/imageRoute.ts", { id: "dam" }),
    route("block-preview", "routes/BlockPreviewPage.tsx"),
    layout("routes/PageLayout.tsx", [
        layout("routes/PageErrorLayout.tsx", [
            index("routes/HomePage.tsx"),
            route("cached", "routes/CachedPage.tsx"),
            route("fetch-cache", "routes/FetchCachePage.tsx"),
            route("not-found", "routes/NotFoundPage.tsx"),
            route("server-error", "routes/ServerErrorPage.tsx"),
            route("render-error", "routes/RenderErrorPage.tsx"),
            route("redirect", "routes/RedirectPage.tsx"),
            route("request-context", "routes/RequestContextPage.tsx"),
            route("preview-info", "routes/PreviewInfoPage.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
