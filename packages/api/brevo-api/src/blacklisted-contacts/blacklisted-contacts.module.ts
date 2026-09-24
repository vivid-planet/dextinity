import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";

import { EmailCampaignScopeInterface } from "../types";
import { BlacklistedContactsService } from "./blacklisted-contacts.service";
import { BlacklistedContactsInterface } from "./entity/blacklisted-contacts.entity.factory";

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
