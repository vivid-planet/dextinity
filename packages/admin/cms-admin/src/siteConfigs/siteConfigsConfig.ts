import type { ContentScope } from "../contentScope/Provider";

export interface SiteConfig {
    url: string;
    preloginEnabled: boolean;
    blockPreviewBaseUrl: string;
    sitePreviewApiUrl: string;
}

export interface SiteConfigsConfig<Configs = unknown> {
    configs: Configs;
    resolveSiteConfigForScope: (configs: Configs, scope: ContentScope) => SiteConfig;
}
