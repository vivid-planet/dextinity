import { JsonLd } from "@dextinity/site-nextjs";
import type { PublicSiteConfig } from "@src/site-configs";
import { buildOrganization } from "@src/util/structuredData/buildOrganization";
import type { Organization } from "schema-dts";

interface Props {
    siteConfig: PublicSiteConfig;
}

export function OrganizationJsonLd({ siteConfig }: Props) {
    return <JsonLd<Organization> data={buildOrganization(siteConfig)} />;
}
