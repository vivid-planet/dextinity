import { getMailConfig } from "@src/mail/util/getMailConfig";
import { loadMessages } from "@src/util/loadMessages";

import { BrevoEmailCampaignPreview } from "./BrevoEmailCampaignPreview";

export default async function Page({ params }: PageProps<"/block-preview/[domain]/[language]/brevo-email-campaign">) {
    const { domain, language } = await params;
    const messages = await loadMessages(language);

    return <BrevoEmailCampaignPreview language={language} messages={messages} config={getMailConfig({ domain, language })} />;
}
