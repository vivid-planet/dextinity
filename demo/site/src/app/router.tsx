import { handleError, noStoreCacheControl, renderPage } from "@dextinity/site-vite-rsc/server";
import type { ContentScope } from "@src/site-configs";
import { getSiteContext } from "@src/util/siteContext";
import { type Context, Hono } from "hono";
import { Fragment, type ReactNode } from "react";

import { DocumentPage } from "./[language]/[[...path]]/DocumentPage";
import { getLayoutLanguage, LanguageLayout } from "./[language]/LanguageLayout";
import { NewsDetailPage } from "./[language]/news/[slug]/NewsDetailPage";
import { NewsIndexPage } from "./[language]/news/NewsIndexPage";
import { ProductDetailPage } from "./[language]/product/[slug]/ProductDetailPage";
import { ProductListPage } from "./[language]/product/ProductListPage";
import { SiteNotFound } from "./[language]/SiteNotFound";
import { loadMailsEntry } from "./api/loadMailsEntry";
import { welcomeEmailRoute } from "./api/welcome-email/route";
import { BlockPreviewLanguageLayout } from "./block-preview/[domain]/[language]/BlockPreviewLanguageLayout";
import { BrevoEmailCampaignBlockPreviewPage } from "./block-preview/[domain]/[language]/brevo-email-campaign/BrevoEmailCampaignBlockPreviewPage";
import { FooterBlockPreviewPage } from "./block-preview/[domain]/[language]/footer/FooterBlockPreviewPage";
import { MainMenuBlockPreviewPage } from "./block-preview/[domain]/[language]/main-menu/MainMenuBlockPreviewPage";
import { PageBlockPreviewPage } from "./block-preview/[domain]/[language]/page/PageBlockPreviewPage";
import { StageBlockPreviewPage } from "./block-preview/[domain]/[language]/stage/StageBlockPreviewPage";
import { WelcomeEmailBlockPreviewPage } from "./block-preview/[domain]/[language]/welcome-email/WelcomeEmailBlockPreviewPage";
import { BlockPreviewLayout } from "./block-preview/[domain]/BlockPreviewLayout";
import { ErrorPage } from "./ErrorPage";
import { graphQLRoute } from "./graphql/route";
import { RootLayout } from "./RootLayout";
import { RootNotFound } from "./RootNotFound";
import { sitemapRoute } from "./sitemap";

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
        notFound: () => (
            <RootLayout lang={getLayoutLanguage(params)}>
                <LanguageLayout domain={domain} language={language}>
                    <SiteNotFound scope={{ domain, language: getLayoutLanguage(params) }} />
                </LanguageLayout>
            </RootLayout>
        ),
        error: () => renderErrorPage(getLayoutLanguage(params)),
        // Preview content must not be cached, also from the block preview, which doesn't set `sitePreview`
        cacheControl: sitePreview || visibility !== "default" ? noStoreCacheControl : publicCacheControl,
    });
}

function renderBlockPreviewPage(c: Context, page: ReactNode) {
    const { domain, language } = c.req.param() as ContentScope;

    return renderPage(c, {
        root: (
            <RootLayout lang={language}>
                <BlockPreviewLayout domain={domain}>
                    <BlockPreviewLanguageLayout language={language}>{page}</BlockPreviewLanguageLayout>
                </BlockPreviewLayout>
            </RootLayout>
        ),
        notFound: renderRootNotFound,
        error: () => renderErrorPage(language),
        cacheControl: noStoreCacheControl,
    });
}

function renderRootNotFound() {
    return (
        <RootLayout lang="en">
            <RootNotFound />
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

export function renderRootNotFoundPage(c: Context) {
    return renderPage(c, {
        root: renderRootNotFound(),
        notFound: renderRootNotFound,
        error: () => renderErrorPage("en"),
        cacheControl: noStoreCacheControl,
        status: 404,
    });
}

export const mailRoutes = new Hono();

mailRoutes.post("/render-brevo-email-campaign", async (c) => (await loadMailsEntry()).renderBrevoEmailCampaign(c.req.raw));
mailRoutes.get("/render-welcome-email", welcomeEmailRoute);

export const blockPreviewRoutes = new Hono();

blockPreviewRoutes.get("/:domain/:language/page", (c) => renderBlockPreviewPage(c, <PageBlockPreviewPage />));
blockPreviewRoutes.get("/:domain/:language/stage", (c) => renderBlockPreviewPage(c, <StageBlockPreviewPage />));
blockPreviewRoutes.get("/:domain/:language/main-menu", (c) => renderBlockPreviewPage(c, <MainMenuBlockPreviewPage />));
blockPreviewRoutes.get("/:domain/:language/footer", (c) => renderBlockPreviewPage(c, <FooterBlockPreviewPage />));
blockPreviewRoutes.get("/:domain/:language/welcome-email", (c) =>
    renderBlockPreviewPage(c, <WelcomeEmailBlockPreviewPage {...(c.req.param() as ContentScope)} />),
);
blockPreviewRoutes.get("/:domain/:language/brevo-email-campaign", (c) =>
    renderBlockPreviewPage(c, <BrevoEmailCampaignBlockPreviewPage {...(c.req.param() as ContentScope)} />),
);

/**
 * The pages of the site, the domain and visibility are available via `getSiteContext()`.
 * Also handles the rewritten requests of predefined pages, see `predefinedPagesMiddleware`.
 */
export const siteRoutes = new Hono();

siteRoutes.on(["GET", "POST"], "/graphql", graphQLRoute);
siteRoutes.get("/sitemap.xml", sitemapRoute);
siteRoutes.get("/", (c) => c.redirect("/en", 307));

// Loaded on demand, so that missing environment variables of these routes don't break the whole site
siteRoutes.post("/:language/api/contact-form", async (c) => (await import("./[language]/api/contact-form/route")).contactFormRoute(c));
siteRoutes.post("/:language/api/file-upload", async (c) => (await import("./[language]/api/file-upload/route")).fileUploadRoute(c));

siteRoutes.get("/:language/news", (c) => renderSitePage(c, (params) => <NewsIndexPage {...params} />));
siteRoutes.get("/:language/news/:slug", (c) => renderSitePage(c, (params) => <NewsDetailPage {...params} slug={c.req.param("slug")} />));
siteRoutes.get("/:language/product", (c) => renderSitePage(c, ({ language }) => <ProductListPage language={language} />));
siteRoutes.get("/:language/product/:slug", (c) => renderSitePage(c, (scope) => <ProductDetailPage scope={scope} slug={c.req.param("slug")} />));
siteRoutes.get("/:language/*", (c) => {
    const [, , ...segments] = c.req.path.split("/");
    const path = segments.filter((segment) => segment !== "").map((segment) => decodeURIComponent(segment));
    return renderSitePage(c, (params) => <DocumentPage {...params} path={path} />);
});

siteRoutes.notFound(renderRootNotFoundPage);
siteRoutes.onError(handleError);
