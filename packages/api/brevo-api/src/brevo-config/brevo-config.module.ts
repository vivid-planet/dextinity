import { MikroOrmModule } from "@mikro-orm/nestjs";
import { type DynamicModule, Module, type Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module.js";
import type { EmailCampaignScopeInterface } from "../types.js";
import { createBrevoConfigResolver } from "./brevo-config.resolver.js";
import type { BrevoConfigInterface } from "./entities/brevo-config-entity.factory.js";

interface BrevoConfigModuleConfig {
    Scope: Type<EmailCampaignScopeInterface>;
    BrevoConfig: Type<BrevoConfigInterface>;
}

@Module({})
export class BrevoConfigModule {
    static register({ Scope, BrevoConfig }: BrevoConfigModuleConfig): DynamicModule {
        const BrevoConfigResolver = createBrevoConfigResolver({ BrevoConfig, Scope });

        return {
            module: BrevoConfigModule,
            imports: [MikroOrmModule.forFeature([BrevoConfig]), BrevoApiModule],
            providers: [BrevoConfigResolver],
        };
    }
}
