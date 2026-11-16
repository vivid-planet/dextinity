import { MikroOrmModule } from "@mikro-orm/nestjs";
import { type DynamicModule, Module, type Type } from "@nestjs/common";

import type { EmailCampaignScopeInterface } from "../types.js";
import { BlacklistedContactsService } from "./blacklisted-contacts.service.js";
import type { BlacklistedContactsInterface } from "./entity/blacklisted-contacts.entity.factory.js";

interface BlacklistedContactsModuleConfig {
    BrevoBlacklistedContacts?: Type<BlacklistedContactsInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}

@Module({})
export class BlacklistedContactsModule {
    static register({ BrevoBlacklistedContacts }: BlacklistedContactsModuleConfig): DynamicModule {
        return {
            module: BlacklistedContactsModule,
            imports: BrevoBlacklistedContacts ? [MikroOrmModule.forFeature([BrevoBlacklistedContacts])] : [],
            providers: BrevoBlacklistedContacts ? [BlacklistedContactsService] : [],
            exports: BrevoBlacklistedContacts ? [BlacklistedContactsService] : [],
        };
    }
}
