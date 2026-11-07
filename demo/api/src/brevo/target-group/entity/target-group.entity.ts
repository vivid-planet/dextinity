import { createTargetGroupEntity } from "@dextinity/brevo-api";
import { BrevoContactFilterAttributes } from "@src/brevo/brevo-contact/dto/brevo-contact-attributes.js";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope.js";

export const TargetGroup = createTargetGroupEntity({ Scope: EmailCampaignContentScope, BrevoFilterAttributes: BrevoContactFilterAttributes });
