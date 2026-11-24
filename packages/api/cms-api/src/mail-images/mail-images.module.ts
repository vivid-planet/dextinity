import { type DynamicModule, Module } from "@nestjs/common";

import { DamMailImageFetcherService } from "./dam-mail-image-fetcher.service";
import { MailImagesModuleConfig } from "./mail-images.config";
import { MAIL_IMAGES_CONFIG } from "./mail-images.constants";
import { MailImagesService } from "./mail-images.service";

/**
 * Attaches the images of a mail as inline (`cid:`) attachments, for mails whose images mail clients can't load from their URL, e.g.
 * because the API is behind an auth proxy. Requires the DAM module.
 */
@Module({})
export class MailImagesModule {
    static register(config: MailImagesModuleConfig): DynamicModule {
        return {
            module: MailImagesModule,
            providers: [{ provide: MAIL_IMAGES_CONFIG, useValue: config }, DamMailImageFetcherService, MailImagesService],
            exports: [MailImagesService],
        };
    }
}
