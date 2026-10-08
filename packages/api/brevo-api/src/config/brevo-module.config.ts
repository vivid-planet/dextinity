import type { Block } from "@dextinity/cms-api";
import type { Type } from "@nestjs/common";

import type { BlacklistedContactsInterface } from "../blacklisted-contacts/entity/blacklisted-contacts.entity.factory";
import type { BrevoEmailImportLogInterface } from "../brevo-email-import-log/entity/brevo-email-import-log.entity.factory";
import type { EmailCampaignInterface } from "../email-campaign/entities/email-campaign-entity.factory";
import type { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory";
import type { BrevoContactAttributesInterface, BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../types";

interface FrontendConfig {
    url: string;
    basicAuth: {
        username: string;
        password: string;
    };
}

export interface BrevoModuleConfig<Scope extends EmailCampaignScopeInterface = EmailCampaignScopeInterface> {
    brevo: {
        resolveConfig: (scope: Scope) => {
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
        Scope: Type<Scope>;
        EmailCampaignContentBlock: Block;
        frontend: FrontendConfig | ((scope: Scope) => FrontendConfig);
    };
    contactsWithoutDoi?: {
        allowAddingContactsWithoutDoi?: boolean;
        emailHashKey?: string;
    };
}
