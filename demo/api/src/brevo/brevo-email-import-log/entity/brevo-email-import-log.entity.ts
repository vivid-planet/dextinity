import { createBrevoEmailImportLogEntity } from "@dextinity/brevo-api";
import { EmailCampaignContentScope } from "@src/brevo/email-campaign/email-campaign-content-scope.js";

export const BrevoEmailImportLog = createBrevoEmailImportLogEntity({ Scope: EmailCampaignContentScope });
