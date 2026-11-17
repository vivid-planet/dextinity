import type { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { EmailCampaignMail } from "@src/brevo/EmailCampaignMail";
import { replaceMailHtmlPlaceholders } from "@src/brevo/util/replaceMailHtmlPlaceholders";
import { RenderedMailForBlockPreview } from "@src/mail/components/RenderedMailForBlockPreview";

const replacePlaceholdersForPreview = (html: string) => replaceMailHtmlPlaceholders(html, "preview");

export function EmailCampaignPreview({ data }: { data: EmailCampaignContentBlockData }) {
    return (
        <RenderedMailForBlockPreview
            mail={(props) => <EmailCampaignMail content={data} {...props} />}
            transformHtml={replacePlaceholdersForPreview}
        />
    );
}
