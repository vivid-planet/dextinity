import { index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    route("api/status", "routes/api/statusRoute.ts"),
    route("dam/*", "routes/damRoute.ts"),
    ...prefix("api", [
        route("render-brevo-email-campaign", "routes/mails/brevoEmailCampaignRoute.ts"),
        route("render-welcome-email", "routes/mails/welcomeEmailRoute.ts"),
    ]),
    route("site-preview", "routes/sitePreviewRoute.ts"),
    route("block-preview/:domain/:language/:type", "routes/blockPreview/BlockPreviewRoute.tsx"),

    // The site is resolved by the middlewares of this layout, from the host or the scope of the site preview
    layout("routes/SiteLayout.tsx", [
        route("graphql", "routes/graphQLRoute.ts"),
        route("robots.txt", "routes/robotsRoute.ts"),
        route("sitemap.xml", "routes/sitemapRoute.ts"),
        route("admin", "routes/adminRoute.ts"),
        index("routes/homeRedirectRoute.ts"),
        route(":language", "routes/LanguageLayout.tsx", { id: "language" }, [
            route("api/contact-form", "routes/api/contactFormRoute.ts"),
            route("api/file-upload", "routes/api/fileUploadRoute.ts"),
            // Renders the not found and error pages inside the header and footer of the language layout
            layout("routes/PageErrorBoundary.tsx", [
                route("news", "routes/news/NewsIndexPage.tsx"),
                route("news/:slug", "routes/news/NewsDetailPage.tsx"),
                route("product", "routes/product/ProductListPage.tsx"),
                route("product/:slug", "routes/product/ProductDetailPage.tsx"),
                index("routes/HomePage.tsx"),
                route("*", "routes/DocumentPage.tsx"),
            ]),
        ]),
    ]),
] satisfies RouteConfig;
