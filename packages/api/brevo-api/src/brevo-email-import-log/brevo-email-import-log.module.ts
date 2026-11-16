import { MikroOrmModule } from "@mikro-orm/nestjs";
import { type DynamicModule, Module, type Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module.js";
import { ConfigModule } from "../config/config.module.js";
import type { EmailCampaignScopeInterface } from "../types.js";
import { BrevoEmailImportLogService } from "./brevo-email-import-log.service.js";
import type { BrevoEmailImportLogInterface } from "./entity/brevo-email-import-log.entity.factory.js";

interface BrevoEmailImportLogModuleConfig {
    BrevoEmailImportLog?: Type<BrevoEmailImportLogInterface>;
    Scope: Type<EmailCampaignScopeInterface>;
}

@Module({})
export class BrevoEmailImportLogModule {
    static register({ Scope, BrevoEmailImportLog }: BrevoEmailImportLogModuleConfig): DynamicModule {
        return {
            module: BrevoEmailImportLogModule,
            imports: [ConfigModule, BrevoApiModule, ...(BrevoEmailImportLog ? [MikroOrmModule.forFeature([BrevoEmailImportLog])] : [])],
            providers: [BrevoEmailImportLogService],
            exports: [BrevoEmailImportLogService],
        };
    }
}
