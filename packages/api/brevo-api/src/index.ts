import type { BrevoPermission } from "./permissions/brevo-permission.enum.js";

export { createBlacklistedContactsEntity } from "./blacklisted-contacts/entity/blacklisted-contacts.entity.factory.js";
export { NewsletterImageBlock } from "./blocks/newsletter-image.block.js";
export { BrevoTransactionalMailsService } from "./brevo-api/brevo-api-transactional-mails.service.js";
export { BrevoContactsService } from "./brevo-contact/brevo-contacts.service.js";
export { SubscribeResponse } from "./brevo-contact/dto/subscribe-response.enum.js";
export { IsValidRedirectURL } from "./brevo-contact/validator/redirect-url.validator.js";
export { createBrevoEmailImportLogEntity } from "./brevo-email-import-log/entity/brevo-email-import-log.entity.factory.js";
export { BrevoModule } from "./brevo-module.js";
export { createEmailCampaignEntity } from "./email-campaign/entities/email-campaign-entity.factory.js";
export { migrationsList } from "./mikro-orm/migrations/migrations.js";
export { BrevoPermission } from "./permissions/brevo-permission.enum.js";
export { createTargetGroupEntity } from "./target-group/entity/target-group-entity.factory.js";

declare module "@dextinity/cms-api" {
    export interface PermissionOverrides {
        brevo: BrevoPermission;
    }
}
