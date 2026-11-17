import { handleError, noStoreCacheControl, renderPage } from "@dextinity/site-vite-rsc/server";
import type { ContentScope } from "@src/site-configs";
import { getSiteContext } from "@src/util/siteContext";
import { type Context, Hono } from "hono";
import { Fragment, type ReactNode } from "react";

import { adminRoute } from "./adminRoute";
import { BlockPreviewLayout } from "./blockPreview/BlockPreviewLayout";
import { DocumentPage } from "./DocumentPage";
import { ErrorPage } from "./ErrorPage";
import { graphQLRoute } from "./graphQLRoute";
import { getLayoutLanguage, LanguageLayout } from "./LanguageLayout";
import { loadMailsEntry } from "./mails/loadMailsEntry";
import { welcomeEmailRoute } from "./mails/welcomeEmailRoute";
import { NewsDetailPage } from "./news/NewsDetailPage";
import { NewsIndexPage } from "./news/NewsIndexPage";
import { ProductDetailPage } from "./product/ProductDetailPage";
import { ProductListPage } from "./product/ProductListPage";
import { robotsRoute } from "./robotsRoute";
import { RootLayout } from "./RootLayout";
import { sitemapRoute } from "./sitemapRoute";
import { SiteNotFound } from "./SiteNotFound";

// Same as Next.js for pages revalidated every 7.5 minutes
const publicCacheControl = "s-maxage=450, stale-while-revalidate=31535550";

async function renderSitePage(c: Context, renderContent: (params: ContentScope) => ReactNode) {
    const { domain, visibility, sitePreview } = getSiteContext();
    const language = c.req.param("language");
    if (!language) {
        throw new Error("Site pages must be routed with a language param");
    }
    const params = { domain, language };

    return renderPage(c, {
        root: (
            <RootLayout lang={getLayoutLanguage(params)}>
                {/* Like Next.js, the layout remounts when the language changes and the page on each path change, so that they don't keep the state of the previous page */}
                <LanguageLayout key={language} domain={domain} language={language}>
                    <Fragment key={c.req.path}>{renderContent(params)}</Fragment>
                </LanguageLayout>
            </RootLayout>
        ),
        notFound: () => renderSiteNotFound(params),
        error: () => renderErrorPage(getLayoutLanguage(params)),
        // Preview content must not be cached, also from the block preview, which doesn't set `sitePreview`
        cacheControl: sitePreview || visibility !== "default" ? noStoreCacheControl : publicCacheControl,
    });
}

async function renderBlockPreviewPage(c: Context) {
    const { domain, language, type } = c.req.param() as ContentScope & { type: string };
    // Loaded on demand, so that the client code of the previews, e.g. the mails, gets its own chunk instead of being loaded on every page
    const { BlockPreview } = await import("./blockPreview/BlockPreview");

    return renderPage(c, {
        root: (
            <RootLayout lang={language}>
                <BlockPreviewLayout domain={domain} language={language}>
                    <BlockPreview type={type} />
                </BlockPreviewLayout>
            </RootLayout>
        ),
        notFound: () => renderSiteNotFound({ domain, language }),
        error: () => renderErrorPage(language),
        cacheControl: noStoreCacheControl,
    });
}

function renderSiteNotFound(params: ContentScope) {
    const scope = { domain: params.domain, language: getLayoutLanguage(params) };
    return (
        <RootLayout lang={scope.language}>
            <LanguageLayout domain={scope.domain} language={scope.language}>
                <SiteNotFound scope={scope} />
            </LanguageLayout>
        </RootLayout>
    );
}

function renderErrorPage(lang: string) {
    return (
        <RootLayout lang={lang}>
            <ErrorPage />
        </RootLayout>
    );
}

/**
 * For paths without a route, in the language of the first path segment if it's one of the site's languages
 */
export function renderNotFoundPage(c: Context) {
    const [, firstPathSegment = ""] = c.req.path.split("/");
    const params = { domain: getSiteContext().domain, language: firstPathSegment };
    return renderPage(c, {
        root: renderSiteNotFound(params),
        notFound: () => renderSiteNotFound(params),
        error: () => renderErrorPage(getLayoutLanguage(params)),
        cacheControl: noStoreCacheControl,
        status: 404,
    });
}

export const mailRoutes = new Hono();

mailRoutes.post("/render-brevo-email-campaign", async (c) => (await loadMailsEntry()).renderBrevoEmailCampaign(c.req.raw));
mailRoutes.get("/render-welcome-email", welcomeEmailRoute);

export const blockPreviewRoutes = new Hono();

blockPreviewRoutes.get("/:domain/:language/:type", renderBlockPreviewPage);

/**
 * The pages of the site, the domain and visibility are available via `getSiteContext()`.
 * Also handles the rewritten requests of predefined pages, see `predefinedPagesMiddleware`.
 */
export const siteRoutes = new Hono();

siteRoutes.on(["GET", "POST"], "/graphql", graphQLRoute);
siteRoutes.get("/robots.txt", robotsRoute);
siteRoutes.get("/sitemap.xml", sitemapRoute);
siteRoutes.get("/admin", adminRoute);
siteRoutes.get("/", (c) => c.redirect("/en", 307));

// Loaded on demand, so that missing environment variables of these routes don't break the whole site
siteRoutes.post("/:language/api/contact-form", async (c) => (await import("./api/contactFormRoute")).contactFormRoute(c));
siteRoutes.post("/:language/api/file-upload", async (c) => (await import("./api/fileUploadRoute")).fileUploadRoute(c));

siteRoutes.get("/:language/news", (c) => renderSitePage(c, (params) => <NewsIndexPage {...params} />));
siteRoutes.get("/:language/news/:slug", (c) => renderSitePage(c, (params) => <NewsDetailPage {...params} slug={c.req.param("slug")} />));
siteRoutes.get("/:language/product", (c) => renderSitePage(c, ({ language }) => <ProductListPage language={language} />));
siteRoutes.get("/:language/product/:slug", (c) => renderSitePage(c, (scope) => <ProductDetailPage scope={scope} slug={c.req.param("slug")} />));
siteRoutes.get("/:language/*", (c) => {
    const [, , ...segments] = c.req.path.split("/");
    const path = segments.filter((segment) => segment !== "").map((segment) => decodeURIComponent(segment));
    return renderSitePage(c, (params) => <DocumentPage {...params} path={path} />);
});

siteRoutes.notFound(renderNotFoundPage);
siteRoutes.onError(handleError);
