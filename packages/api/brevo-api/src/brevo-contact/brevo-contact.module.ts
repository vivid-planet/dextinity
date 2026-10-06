import { FileUpload } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { type DynamicModule, Module, type Type } from "@nestjs/common";

import type { BlacklistedContactsInterface } from "../blacklisted-contacts/entity/blacklisted-contacts.entity.factory.js";
import { BrevoApiModule } from "../brevo-api/brevo-api.module.js";
import { createBrevoContactImportConsole } from "../brevo-contact/brevo-contact-import.console.js";
import { BrevoContactImportService } from "../brevo-contact/brevo-contact-import.service.js";
import { BrevoEmailImportLogModule } from "../brevo-email-import-log/brevo-email-import-log.module.js";
import type { BrevoEmailImportLogInterface } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory.js";
import { ConfigModule } from "../config/config.module.js";
import type { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory.js";
import type { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../types.js";
import { DeleteUnsubscribedBrevoContactsConsole } from "./brevo-contact.console.js";
import { createBrevoContactResolver } from "./brevo-contact.resolver.js";
import { createBrevoContactImportResolver } from "./brevo-contact-import.resolver.js";
import { BrevoContactsService } from "./brevo-contacts.service.js";
import { BrevoContactFactory } from "./dto/brevo-contact.factory.js";
import { BrevoContactInputFactory } from "./dto/brevo-contact-input.factory.js";
import { BrevoTestContactInputFactory } from "./dto/brevo-test-contact-input.factory.js";
import { SubscribeInputFactory } from "./dto/subscribe-input.factory.js";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service.js";
import { IsValidRedirectURLConstraint } from "./validator/redirect-url.validator.js";

interface BrevoContactModuleConfig {
    BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
    BrevoTargetGroup: Type<TargetGroupInterface>;
    BlacklistedContacts?: Type<BlacklistedContactsInterface>;
    BrevoEmailImportLog?: Type<BrevoEmailImportLogInterface>;
}

@Module({})
export class BrevoContactModule {
    static register({
        BrevoContactAttributes,
        Scope,
        BrevoTargetGroup,
        BlacklistedContacts,
        BrevoEmailImportLog,
    }: BrevoContactModuleConfig): DynamicModule {
        const BrevoContact = BrevoContactFactory.create({ BrevoContactAttributes });
        const BrevoContactSubscribeInput = SubscribeInputFactory.create({ BrevoContactAttributes, Scope });
        const [BrevoContactInput, BrevoContactUpdateInput] = BrevoContactInputFactory.create({ BrevoContactAttributes, Scope });
        const [BrevoTestContactInput] = BrevoTestContactInputFactory.create({ BrevoContactAttributes, Scope });

        const BrevoContactResolver = createBrevoContactResolver({
            BrevoContact,
            BrevoContactSubscribeInput,
            Scope,
            BrevoContactInput,
            BrevoContactUpdateInput,
            BrevoTestContactInput,
        });

        const BrevoContactImportResolver = createBrevoContactImportResolver({ Scope, BrevoContact });
        const BrevoContactImportConsole = createBrevoContactImportConsole({ Scope });

        const mikroOrmEntities = [BrevoTargetGroup, FileUpload];

        const imports = [
            BrevoApiModule,
            ConfigModule,
            MikroOrmModule.forFeature(mikroOrmEntities),
            ...(BrevoEmailImportLog ? [BrevoEmailImportLogModule] : []),
        ];
        return {
            module: BrevoContactModule,
            imports: imports,
            providers: [
                BrevoContactImportService,
                BrevoContactsService,
                BrevoContactResolver,
                BrevoContactImportResolver,
                EcgRtrListService,
                IsValidRedirectURLConstraint,
                DeleteUnsubscribedBrevoContactsConsole,
                BrevoContactImportConsole,
            ],
            exports: [BrevoContactsService, BrevoContactImportService],
        };
    }
}
