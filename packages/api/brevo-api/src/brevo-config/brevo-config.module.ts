import { ScopeInterface } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { createBrevoConfigResolver } from "./brevo-config.resolver";
import { BrevoConfigInterface } from "./entities/brevo-config-entity.factory";

interface BrevoConfigModuleConfig {
    Scope: Type<ScopeInterface>;
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
