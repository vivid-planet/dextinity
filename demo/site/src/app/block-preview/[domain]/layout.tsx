import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import type { PropsWithChildren } from "react";

export default async function BlockPreviewLayout({ children, domain }: PropsWithChildren<{ domain: string }>) {
    const siteConfig = getSiteConfigForDomain(domain);
    return <SiteConfigProvider siteConfig={siteConfig}>{children}</SiteConfigProvider>;
}
