import { createBlacklistedContactsEntity } from "@dextinity/brevo-api";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope";

export const BlacklistedContacts = createBlacklistedContactsEntity({ Scope: EmailCampaignContentScope });
