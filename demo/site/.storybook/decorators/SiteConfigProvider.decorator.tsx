import type { PublicSiteConfig } from "@src/site-configs.d";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import type { Decorator } from "@storybook/nextjs-vite";

// On the site this comes from the site config of the requested domain. Components such as Breadcrumbs and
// ContactFormBlock read it, so stories need a stand-in for the "main" site config.
const siteConfig: PublicSiteConfig = {
    name: "Dextinity Site Main",
    domains: {
        main: "localhost:3000",
    },
    url: "http://localhost:3000",
    scope: {
        domain: "main",
        languages: ["en", "de"],
    },
    recaptchaSiteKey: "",
    organization: {
        name: "Vivid Planet Software GmbH",
        url: "https://www.vivid-planet.com",
    },
};

export const SiteConfigProviderDecorator: Decorator = (Story) => (
    <SiteConfigProvider siteConfig={siteConfig}>
        <Story />
    </SiteConfigProvider>
);
