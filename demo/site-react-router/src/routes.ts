import { index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * The routes of the site, the counterpart of the `app` folder of the Next.js site.
 * The pages of the site are below the site layout, whose middlewares resolve the site from the host or the site preview.
 */
export default [
    route("api/status", "routes/api/statusRoute.ts"),
    route("dam/*", "routes/damRoute.ts"),
    route("admin", "routes/adminRoute.ts"),
    ...prefix("api", [
        route("render-brevo-email-campaign", "routes/mails/brevoEmailCampaignRoute.ts"),
        route("render-welcome-email", "routes/mails/welcomeEmailRoute.ts"),
    ]),
    route("site-preview", "routes/sitePreviewRoute.ts"),
    route("block-preview/:domain/:language", "routes/blockPreview/BlockPreviewLayout.tsx", [
        route("page", "routes/blockPreview/PageBlockPreview.tsx"),
        route("stage", "routes/blockPreview/StageBlockPreview.tsx"),
        route("main-menu", "routes/blockPreview/MainMenuBlockPreview.tsx"),
        route("footer", "routes/blockPreview/FooterBlockPreview.tsx"),
        route("welcome-email", "routes/blockPreview/WelcomeEmailBlockPreview.tsx"),
        route("brevo-email-campaign", "routes/blockPreview/BrevoEmailCampaignBlockPreview.tsx"),
    ]),
    layout("routes/SiteLayout.tsx", { id: "site" }, [
        route("graphql", "routes/graphQLRoute.ts"),
        route("robots.txt", "routes/robotsRoute.ts"),
        route("sitemap.xml", "routes/sitemapRoute.ts"),
        index("routes/homeRedirectRoute.ts"),
        route(":language", "routes/LanguageLayout.tsx", { id: "language" }, [
            route("api/contact-form", "routes/api/contactFormRoute.ts"),
            route("api/file-upload", "routes/api/fileUploadRoute.ts"),
            // Renders the not found and error pages between the header and the footer of the language layout
            layout("routes/PageErrorLayout.tsx", [
                route("product", "routes/product/ProductListPage.tsx"),
                route("product/:slug", "routes/product/ProductDetailPage.tsx"),
                // The pages of the page tree and the predefined pages, e.g. the news below their path in the page tree.
                // The splat doesn't match the home page of a language, which has the path "/" in the page tree.
                index("routes/DocumentPage.tsx", { id: "homePage" }),
                route("*", "routes/DocumentPage.tsx", { id: "documentPage" }),
            ]),
        ]),
    ]),
] satisfies RouteConfig;
