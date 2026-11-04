import { noStoreCacheControl } from "@dextinity/site-react-router/server";
import { contentSecurityPolicyHeadersMiddleware } from "@src/middleware/contentSecurityPolicyHeaders";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages";
import { getSiteConfigs } from "@src/util/siteConfig";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import { data, Outlet } from "react-router";

import type { Route } from "./+types/BlockPreviewLayout";

const noStoreCacheControlMiddleware: Route.MiddlewareFunction = async (_args, next) => {
    const response = await next();
    response.headers.set("Cache-Control", noStoreCacheControl);
    return response;
};

export const middleware: Route.MiddlewareFunction[] = [contentSecurityPolicyHeadersMiddleware, noStoreCacheControlMiddleware];

export function loader({ params: { domain, language } }: Route.LoaderArgs) {
    const siteConfig = getSiteConfigs().find((siteConfig) => siteConfig.scope.domain === domain);
    if (!siteConfig) {
        throw data(null, { status: 404 });
    }
    return { siteConfig, language };
}

/**
 * The layout of the block previews of the admin, the counterpart of `block-preview/[domain]/layout.tsx` and `block-preview/[domain]/[language]/layout.tsx` of the Next.js site
 */
export async function ServerComponent({ loaderData: { siteConfig, language } }: Route.ServerComponentProps) {
    const messages = await loadMessages(language);
    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            <IntlProvider locale={language} messages={messages}>
                <Outlet />
            </IntlProvider>
        </SiteConfigProvider>
    );
}
