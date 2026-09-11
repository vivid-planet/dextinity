import type { BrevoPermission } from "./permissions/brevo-permission.enum";

export { createBlacklistedContactsEntity } from "./blacklisted-contacts/entity/blacklisted-contacts.entity.factory";
export { NewsletterImageBlock } from "./blocks/newsletter-image.block";
export { BrevoTransactionalMailsService } from "./brevo-api/brevo-api-transactional-mails.service";
export { BrevoContactsService } from "./brevo-contact/brevo-contacts.service";
export { SubscribeResponse } from "./brevo-contact/dto/subscribe-response.enum";
export { IsValidRedirectURL } from "./brevo-contact/validator/redirect-url.validator";
export { createBrevoEmailImportLogEntity } from "./brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
export { BrevoModule } from "./brevo-module";
export { createEmailCampaignEntity } from "./email-campaign/entities/email-campaign-entity.factory";
export { migrationsList } from "./mikro-orm/migrations/migrations";
export { BrevoPermission } from "./permissions/brevo-permission.enum";
export { createTargetGroupEntity } from "./target-group/entity/target-group-entity.factory";

declare module "@dextinity/cms-api" {
    export interface PermissionOverrides {
        brevo: BrevoPermission;
    }
}
