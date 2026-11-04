import { SitePreviewProvider } from "@dextinity/site-nextjs";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { SiteConfigProvider } from "@src/util/SiteConfigProvider";
import { draftMode } from "next/headers";

export default async function SiteLayout({ children, params }: LayoutProps<"/[visibility]/[domain]">) {
    const { domain } = await params;
    const siteConfig = getSiteConfigForDomain(domain);
    const isDraftModeEnabled = (await draftMode()).isEnabled;

    return (
        <SiteConfigProvider siteConfig={siteConfig}>
            {isDraftModeEnabled ? <SitePreviewProvider>{children}</SitePreviewProvider> : children}
        </SiteConfigProvider>
    );
}
