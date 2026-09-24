import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";

import { ConfigModule } from "../config/config.module";
import { BrevoApiCampaignsService } from "./brevo-api-campaigns.service";
import { BrevoApiClientFactory } from "./brevo-api-client.factory";
import { BrevoApiContactsService } from "./brevo-api-contact.service";
import { BrevoApiFoldersService } from "./brevo-api-folders.service";
import { BrevoApiSenderService } from "./brevo-api-sender.service";
import { BrevoTransactionalMailsService } from "./brevo-api-transactional-mails.service";

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
