import { getMailConfig } from "@src/mail/util/getMailConfig";

import type { Route } from "./+types/BrevoEmailCampaignBlockPreview";
import { BrevoEmailCampaignBlockPreviewContent } from "./BrevoEmailCampaignBlockPreviewContent";

export function ServerComponent({ params: { domain, language } }: Route.ServerComponentProps) {
    return <BrevoEmailCampaignBlockPreviewContent config={getMailConfig({ domain, language })} />;
}
