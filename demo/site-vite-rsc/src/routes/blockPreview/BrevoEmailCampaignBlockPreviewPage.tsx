import { getMailConfig } from "@src/mail/util/getMailConfig";
import type { ContentScope } from "@src/site-configs";
import { loadMessages } from "@src/util/loadMessages";

import { BrevoEmailCampaignPreview } from "./BrevoEmailCampaignPreview";

export async function BrevoEmailCampaignBlockPreviewPage({ domain, language }: ContentScope) {
    const messages = await loadMessages(language);

    return <BrevoEmailCampaignPreview language={language} messages={messages} config={getMailConfig({ domain, language })} />;
}
