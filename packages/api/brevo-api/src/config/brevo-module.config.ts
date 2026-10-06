import type { Block } from "@dextinity/cms-api";
import type { Type } from "@nestjs/common";

import type { BlacklistedContactsInterface } from "../blacklisted-contacts/entity/blacklisted-contacts.entity.factory.js";
import type { BrevoEmailImportLogInterface } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory.js";
import type { EmailCampaignInterface } from "../email-campaign/entities/email-campaign-entity.factory.js";
import type { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory.js";
import type { BrevoContactAttributesInterface, BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../types.js";

interface FrontendConfig {
    url: string;
    basicAuth: {
        username: string;
        password: string;
    };
}

// Declared as a method to make the parameter bivariant, so applications can narrow the scope to their own scope type
type ResolveFrontendConfig = { resolve(scope: EmailCampaignScopeInterface): FrontendConfig }["resolve"];

export interface BrevoModuleConfig {
    brevo: {
        // Method syntax makes the parameter bivariant, so applications can narrow the scope to their own scope type
        resolveConfig(scope: EmailCampaignScopeInterface): {
            apiKey: string;
            redirectUrlForImport: string;
        };
        BlacklistedContacts?: Type<BlacklistedContactsInterface>;
        BrevoContactAttributes?: Type<BrevoContactAttributesInterface>;
        BrevoContactFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
        EmailCampaign: Type<EmailCampaignInterface>;
        TargetGroup: Type<TargetGroupInterface>;
        BrevoEmailImportLog?: Type<BrevoEmailImportLogInterface>;
    };
    ecgRtrList: {
        apiKey: string;
    };
    emailCampaigns: {
        Scope: Type<EmailCampaignScopeInterface>;
        EmailCampaignContentBlock: Block;
        frontend: FrontendConfig | ResolveFrontendConfig;
    };
    contactsWithoutDoi?: {
        allowAddingContactsWithoutDoi?: boolean;
        emailHashKey?: string;
    };
}
