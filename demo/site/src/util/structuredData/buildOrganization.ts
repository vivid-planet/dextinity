import type { PublicSiteConfig } from "@src/site-configs";
import type { Organization, WithContext } from "schema-dts";

// schema-dts types `Organization` as a union that includes `string`; the builders only ever produce the object form.
type OrganizationNode = Exclude<Organization, string>;

function toAbsoluteUrl(url: string, siteUrl: string): string {
    return new URL(url, siteUrl).toString();
}

export function buildOrganizationNode(siteConfig: PublicSiteConfig): OrganizationNode {
    const { organization, url: siteUrl } = siteConfig;

    return {
        "@type": "Organization",
        name: organization.name,
        url: organization.url ?? siteUrl,
        ...(organization.logo ? { logo: toAbsoluteUrl(organization.logo, siteUrl) } : {}),
        ...(organization.sameAs?.length ? { sameAs: organization.sameAs } : {}),
        ...(organization.description ? { description: organization.description } : {}),
    };
}

export function buildOrganization(siteConfig: PublicSiteConfig): WithContext<Organization> {
    return { "@context": "https://schema.org", ...buildOrganizationNode(siteConfig) };
}
