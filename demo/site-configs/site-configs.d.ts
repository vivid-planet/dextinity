import type { BaseSiteConfig, ExtractPrivateSiteConfig, ExtractPublicSiteConfig } from "@comet/cli";

export type ContentScope = {
    domain: string;
    language: string;
    // Additional dimensions used to test behavior with a large number of scopes (see `availableContentScopes` in demo/api app.module.ts).
    // Optional so existing `{ domain, language }` scope objects keep type-checking.
    organization?: string;
    country?: string;
};

export interface SiteConfig extends BaseSiteConfig {
    public: {
        scope: {
            domain: string;
            languages: string[];
        };
    };
}

export type PrivateSiteConfig = ExtractPrivateSiteConfig<SiteConfig>;
export type PublicSiteConfig = ExtractPublicSiteConfig<SiteConfig>;
