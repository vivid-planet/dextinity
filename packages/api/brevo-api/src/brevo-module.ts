import { FileUploadsService } from "@dextinity/cms-api";
import { EntityClass } from "@mikro-orm/postgresql";
import { DynamicModule, Global, Module, OnModuleInit, ValueProvider } from "@nestjs/common";

import { BlacklistedContactsModule } from "./blacklisted-contacts/blacklisted-contacts.module";
import { BrevoApiModule } from "./brevo-api/brevo-api.module";
import { BrevoConfigModule } from "./brevo-config/brevo-config.module";
import { BrevoConfigEntityFactory } from "./brevo-config/entities/brevo-config-entity.factory";
import { BrevoContactModule } from "./brevo-contact/brevo-contact.module";
import { BrevoEmailImportLogModule } from "./brevo-email-import-log/brevo-email-import-log.module";
import { BrevoModuleConfig } from "./config/brevo-module.config";
import {
    BREVO_BLACKLISTED_CONTACTS_ENTITY,
    BREVO_CONFIG_ENTITY,
    BREVO_EMAIL_CAMPAIGN_ENTITY,
    BREVO_EMAIL_IMPORT_LOG_ENTITY,
    BREVO_TARGET_GROUP_ENTITY,
} from "./config/brevo-module.constants";
import { ConfigModule } from "./config/config.module";
import { EmailCampaignModule } from "./email-campaign/email-campaign.module";
import { TargetGroupModule } from "./target-group/target-group.module";

@Global()
@Module({})
export class BrevoModule implements OnModuleInit {
    constructor(private readonly fileUploadsService: FileUploadsService) {}

    onModuleInit(): void {
        if (!this.fileUploadsService.acceptsMimeType("text/csv")) {
            throw new Error("BrevoModule requires mime type 'text/csv' in FileUploadsModule's config");
        }
    }

    static register(config: BrevoModuleConfig): DynamicModule {
        const BrevoConfig = BrevoConfigEntityFactory.create({
            Scope: config.emailCampaigns.Scope,
        });

        const entityProviders: ValueProvider<EntityClass<object>>[] = [
            { provide: BREVO_CONFIG_ENTITY, useValue: BrevoConfig },
            { provide: BREVO_TARGET_GROUP_ENTITY, useValue: config.brevo.TargetGroup },
            { provide: BREVO_EMAIL_CAMPAIGN_ENTITY, useValue: config.brevo.EmailCampaign },
        ];

        if (config.brevo.BlacklistedContacts) {
            entityProviders.push({ provide: BREVO_BLACKLISTED_CONTACTS_ENTITY, useValue: config.brevo.BlacklistedContacts });
        }

        if (config.brevo.BrevoEmailImportLog) {
            entityProviders.push({ provide: BREVO_EMAIL_IMPORT_LOG_ENTITY, useValue: config.brevo.BrevoEmailImportLog });
        }

        const imports = [
            BrevoApiModule,
            BrevoContactModule.register({
                BrevoContactAttributes: config.brevo.BrevoContactAttributes,
                Scope: config.emailCampaigns.Scope,
                BrevoTargetGroup: config.brevo.TargetGroup,
                BlacklistedContacts: config.brevo.BlacklistedContacts,
                BrevoEmailImportLog: config.brevo.BrevoEmailImportLog,
            }),
            EmailCampaignModule.register({
                EmailCampaignContentBlock: config.emailCampaigns.EmailCampaignContentBlock,
                Scope: config.emailCampaigns.Scope,
                BrevoTargetGroup: config.brevo.TargetGroup,
                BrevoEmailCampaign: config.brevo.EmailCampaign,
                BrevoConfig,
            }),
            TargetGroupModule.register({
                Scope: config.emailCampaigns.Scope,
                BrevoFilterAttributes: config.brevo.BrevoContactFilterAttributes,
                BrevoTargetGroup: config.brevo.TargetGroup,
            }),
            BrevoConfigModule.register({ BrevoConfig, Scope: config.emailCampaigns.Scope }),
            ConfigModule.forRoot(config),
        ];

        if (config.brevo.BlacklistedContacts) {
            imports.push(
                BlacklistedContactsModule.register({
                    Scope: config.emailCampaigns.Scope,
                    BrevoBlacklistedContacts: config.brevo.BlacklistedContacts,
                }),
            );
        }

        if (config.brevo.BrevoEmailImportLog) {
            imports.push(
                BrevoEmailImportLogModule.register({
                    Scope: config.emailCampaigns.Scope,
                    BrevoEmailImportLog: config.brevo.BrevoEmailImportLog,
                }),
            );
        }

        return {
            module: BrevoModule,
            imports,
            providers: entityProviders,
            exports: [
                ...entityProviders,
                TargetGroupModule,
                BrevoContactModule,
                BrevoApiModule,
                ...(config.brevo.BlacklistedContacts ? [BlacklistedContactsModule] : []),
                ...(config.brevo.BrevoEmailImportLog ? [BrevoEmailImportLogModule] : []),
            ],
        };
    }
}
