import { type DynamicModule, Global, Module } from "@nestjs/common";

import type { BrevoModuleConfig } from "./brevo-module.config.js";
import { BREVO_MODULE_CONFIG } from "./brevo-module.constants.js";

@Global()
@Module({})
export class ConfigModule {
    static forRoot(config: BrevoModuleConfig): DynamicModule {
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
