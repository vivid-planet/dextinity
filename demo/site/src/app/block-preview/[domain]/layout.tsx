export const dynamic = "force-dynamic";

import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";

export default async function BlockPreviewLayout({ children, params }: LayoutProps<"/block-preview/[domain]">) {
    const { domain } = await params;
    const siteConfig = getSiteConfigForDomain(domain);
    return <SiteConfigProvider siteConfig={siteConfig}>{children}</SiteConfigProvider>;
}
