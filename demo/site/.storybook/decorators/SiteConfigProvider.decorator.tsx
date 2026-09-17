import type { Decorator } from "@storybook/nextjs-vite";

import getSiteConfigs from "../../../site-configs/site-configs";
import type { PublicSiteConfig, SiteConfig } from "../../src/site-configs.d";
import { SiteConfigProvider } from "../../src/util/SiteConfigProvider";

// The CLI exports only the types of this transformation, so `dextinity inject-site-configs` and this have to stay in sync.
function toPublicSiteConfig({ public: publicConfig, ...siteConfig }: SiteConfig): PublicSiteConfig {
    const domain = siteConfig.domains.preliminary ?? siteConfig.domains.main;

    return {
        ...publicConfig,
        name: siteConfig.name,
        domains: siteConfig.domains,
        preloginEnabled: siteConfig.preloginEnabled || false,
        url: domain.includes("localhost") ? `http://${domain}` : `https://${domain}`,
    };
}

const publicSiteConfigs = getSiteConfigs("local").map(toPublicSiteConfig);

// On the site this comes from the site config of the requested domain. Components such as Breadcrumbs and
// ContactFormBlock read it, so stories need one. Set the `siteConfigDomain` parameter to render a story
// under a site other than the first one.
export const SiteConfigProviderDecorator: Decorator = (Story, { parameters }) => {
    const siteConfig = publicSiteConfigs.find((config) => config.scope.domain === parameters.siteConfigDomain) ?? publicSiteConfigs[0];

    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            <Story />
        </SiteConfigProvider>
    );
};
