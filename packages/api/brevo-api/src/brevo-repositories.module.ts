import { EntityManager } from "@mikro-orm/postgresql";
import { DynamicModule, FactoryProvider, Global, Module, Type } from "@nestjs/common";

import { BlacklistedContactsInterface } from "./blacklisted-contacts/entity/blacklisted-contacts.entity.factory";
import { BrevoConfigInterface } from "./brevo-config/entities/brevo-config-entity.factory";
import { BrevoEmailImportLogInterface } from "./brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import {
    BREVO_BLACKLISTED_CONTACTS_REPOSITORY,
    BREVO_CONFIG_REPOSITORY,
    BREVO_EMAIL_CAMPAIGN_REPOSITORY,
    BREVO_EMAIL_IMPORT_LOG_REPOSITORY,
    BREVO_TARGET_GROUP_REPOSITORY,
} from "./config/brevo-module.constants";
import { EmailCampaignInterface } from "./email-campaign/entities/email-campaign-entity.factory";
import { TargetGroupInterface } from "./target-group/entity/target-group-entity.factory";

interface BrevoRepositoriesModuleConfig {
    BrevoConfig: Type<BrevoConfigInterface>;
    BrevoTargetGroup: Type<TargetGroupInterface>;
    BrevoEmailCampaign: Type<EmailCampaignInterface>;
    BrevoBlacklistedContacts?: Type<BlacklistedContactsInterface>;
    BrevoEmailImportLog?: Type<BrevoEmailImportLogInterface>;
}

function createRepositoryProvider(token: string, entity: Type<object>): FactoryProvider {
    return {
        provide: token,
        useFactory: (entityManager: EntityManager) => entityManager.getRepository(entity),
        inject: [EntityManager],
    };
}

@Global()
@Module({})
export class BrevoRepositoriesModule {
    static register({
        BrevoConfig,
        BrevoTargetGroup,
        BrevoEmailCampaign,
        BrevoBlacklistedContacts,
        BrevoEmailImportLog,
    }: BrevoRepositoriesModuleConfig): DynamicModule {
        const providers = [
            createRepositoryProvider(BREVO_CONFIG_REPOSITORY, BrevoConfig),
            createRepositoryProvider(BREVO_TARGET_GROUP_REPOSITORY, BrevoTargetGroup),
            createRepositoryProvider(BREVO_EMAIL_CAMPAIGN_REPOSITORY, BrevoEmailCampaign),
            ...(BrevoBlacklistedContacts ? [createRepositoryProvider(BREVO_BLACKLISTED_CONTACTS_REPOSITORY, BrevoBlacklistedContacts)] : []),
            ...(BrevoEmailImportLog ? [createRepositoryProvider(BREVO_EMAIL_IMPORT_LOG_REPOSITORY, BrevoEmailImportLog)] : []),
        ];

        return {
            module: BrevoRepositoriesModule,
            providers,
            exports: providers.map((provider) => provider.provide),
        };
    }
}
