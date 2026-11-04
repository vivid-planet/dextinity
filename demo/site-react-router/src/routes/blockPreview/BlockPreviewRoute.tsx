import { notFound } from "@dextinity/site-react-router";
import { noStoreCacheControl } from "@dextinity/site-react-router/server";
import { IntlProvider } from "@src/util/IntlProvider";
import { loadMessages } from "@src/util/loadMessages.server";
import { getSiteConfigs } from "@src/util/siteConfig.server";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import { data } from "react-router";

import type { Route } from "./+types/BlockPreviewRoute";
import { BlockPreview } from "./BlockPreview";

export function headers() {
    return { "Cache-Control": noStoreCacheControl };
}

/**
 * The block preview of the admin, one route for all previews, e.g. `/block-preview/main/en/page`
 */
export async function loader({ params: { domain, language, type } }: Route.LoaderArgs) {
    const siteConfig = getSiteConfigs().find((siteConfig) => siteConfig.scope.domain === domain);
    if (!siteConfig || !BlockPreview.hasPreview(type)) {
        notFound();
    }
    return data({ siteConfig, messages: await loadMessages(language) });
}

export default function BlockPreviewRoute({ loaderData: { siteConfig, messages }, params: { language, type } }: Route.ComponentProps) {
    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            <IntlProvider locale={language} messages={messages}>
                <BlockPreview type={type} />
            </IntlProvider>
        </SiteConfigProvider>
    );
}
