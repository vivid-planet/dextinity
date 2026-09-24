import { DynamicModule, Global, Module } from "@nestjs/common";

import { EmailCampaignScopeInterface } from "../types";
import { BrevoModuleConfig } from "./brevo-module.config";
import { BREVO_MODULE_CONFIG } from "./brevo-module.constants";

@Global()
@Module({})
export class ConfigModule {
    static forRoot<Scope extends EmailCampaignScopeInterface>(config: BrevoModuleConfig<Scope>): DynamicModule {
        return {
            module: ConfigModule,
            providers: [
                {
                    provide: BREVO_MODULE_CONFIG,
                    useValue: config,
                },
            ],
            exports: [BREVO_MODULE_CONFIG],
        };
    }
}
