import { JsonLd } from "@dextinity/site-nextjs";
import type { PublicSiteConfig } from "@src/site-configs";
import type { Organization, WithContext } from "schema-dts";

interface Props {
    siteConfig: PublicSiteConfig;
}

function toAbsoluteUrl(url: string, siteUrl: string): string {
    return url.startsWith("http") ? url : new URL(url, siteUrl).toString();
}

export function OrganizationJsonLd({ siteConfig }: Props) {
    const { organization, url: siteUrl } = siteConfig;

    const data: WithContext<Organization> = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: organization.name,
        url: organization.url ?? siteUrl,
        ...(organization.logo ? { logo: toAbsoluteUrl(organization.logo, siteUrl) } : {}),
        ...(organization.sameAs?.length ? { sameAs: organization.sameAs } : {}),
        ...(organization.description ? { description: organization.description } : {}),
    };

    return <JsonLd<Organization> data={data} />;
}
