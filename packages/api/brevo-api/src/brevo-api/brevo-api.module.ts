import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module.js";
import { BrevoApiCampaignsService } from "./brevo-api-campaigns.service.js";
import { BrevoApiClientFactory } from "./brevo-api-client.factory.js";
import { BrevoApiContactsService } from "./brevo-api-contact.service.js";
import { BrevoApiFoldersService } from "./brevo-api-folders.service.js";
import { BrevoApiSenderService } from "./brevo-api-sender.service.js";
import { BrevoTransactionalMailsService } from "./brevo-api-transactional-mails.service.js";

@Module({
    imports: [ConfigModule, CacheModule.register({ ttl: 1000 * 60 })],
    providers: [
        BrevoApiClientFactory,
        BrevoApiContactsService,
        BrevoApiCampaignsService,
        BrevoTransactionalMailsService,
        BrevoApiSenderService,
        BrevoApiFoldersService,
    ],
    exports: [BrevoApiContactsService, BrevoApiCampaignsService, BrevoTransactionalMailsService, BrevoApiSenderService, BrevoApiFoldersService],
})
export class BrevoApiModule {}
