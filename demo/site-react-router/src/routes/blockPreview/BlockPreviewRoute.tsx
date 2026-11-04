import { notFound } from "@dextinity/site-react-router";
import { noStoreCacheControl } from "@dextinity/site-react-router/server";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages";
import { getSiteConfigs } from "@src/util/siteConfig";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";

import type { Route } from "./+types/BlockPreviewRoute";
import { BlockPreview } from "./BlockPreview";
import { isBlockPreviewType } from "./blockPreviewTypes";

export function headers() {
    return { "Cache-Control": noStoreCacheControl };
}

/**
 * The block preview of the admin, one route for all previews, e.g. `/block-preview/main/en/page`
 */
export function loader({ params: { domain, type } }: Route.LoaderArgs) {
    const siteConfig = getSiteConfigs().find((siteConfig) => siteConfig.scope.domain === domain);
    if (!siteConfig || !isBlockPreviewType(type)) {
        notFound();
    }
    return { siteConfig };
}

export async function ServerComponent({ loaderData: { siteConfig }, params: { language, type } }: Route.ServerComponentProps) {
    const messages = await loadMessages(language);
    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            <IntlProvider locale={language} messages={messages}>
                <BlockPreview type={type} />
            </IntlProvider>
        </SiteConfigProvider>
    );
}
