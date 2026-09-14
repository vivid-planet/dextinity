import { FileUpload } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";

import { BlacklistedContactsInterface } from "../blacklisted-contacts/entity/blacklisted-contacts.entity.factory";
import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { createBrevoContactImportConsole } from "../brevo-contact/brevo-contact-import.console";
import { BrevoContactImportService } from "../brevo-contact/brevo-contact-import.service";
import { BrevoEmailImportLogModule } from "../brevo-email-import-log/brevo-email-import-log.module";
import { BrevoEmailImportLogInterface } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import { ConfigModule } from "../config/config.module";
import { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory";
import { BrevoContactAttributesInterface, EmailCampaignScopeInterface } from "../types";
import { DeleteUnsubscribedBrevoContactsConsole } from "./brevo-contact.console";
import { createBrevoContactResolver } from "./brevo-contact.resolver";
import { createBrevoContactImportResolver } from "./brevo-contact-import.resolver";
import { BrevoContactsService } from "./brevo-contacts.service";
import { BrevoContactFactory } from "./dto/brevo-contact.factory";
import { BrevoContactInputFactory } from "./dto/brevo-contact-input.factory";
import { BrevoTestContactInputFactory } from "./dto/brevo-test-contact-input.factory";
import { SubscribeInputFactory } from "./dto/subscribe-input.factory";
import { EcgRtrListService } from "./ecg-rtr-list/ecg-rtr-list.service";
import { IsValidRedirectURLConstraint } from "./validator/redirect-url.validator";

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

        const mikroOrmEntities = [BrevoTargetGroup, FileUpload, "BrevoConfig", ...(BlacklistedContacts ? ["BrevoBlacklistedContacts"] : [])];

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
