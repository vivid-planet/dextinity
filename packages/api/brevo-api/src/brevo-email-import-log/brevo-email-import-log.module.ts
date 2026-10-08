import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { ConfigModule } from "../config/config.module";
import { EmailCampaignScopeInterface } from "../types";
import { BrevoEmailImportLogService } from "./brevo-email-import-log.service";
import { BrevoEmailImportLogInterface } from "./entity/brevo-email-import-log.entity.factory";

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
