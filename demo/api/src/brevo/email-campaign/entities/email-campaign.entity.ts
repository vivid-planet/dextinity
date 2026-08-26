import { createEmailCampaignEntity } from "@dextinity/brevo-api";
import { EmailCampaignContentBlock } from "@src/brevo/email-campaign/blocks/email-campaign-content.block";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope";
import { TargetGroup } from "@src/brevo/target-group/entity/target-group.entity";

export const EmailCampaign = createEmailCampaignEntity({
    EmailCampaignContentBlock: EmailCampaignContentBlock,
    Scope: EmailCampaignContentScope,
    TargetGroup: TargetGroup,
});
