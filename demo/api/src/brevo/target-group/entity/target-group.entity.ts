import { createTargetGroupEntity } from "@dextinity/brevo-api";
import { BrevoContactFilterAttributes } from "@src/brevo/brevo-contact/dto/brevo-contact-attributes";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope";

export const TargetGroup = createTargetGroupEntity({ Scope: EmailCampaignContentScope, BrevoFilterAttributes: BrevoContactFilterAttributes });
