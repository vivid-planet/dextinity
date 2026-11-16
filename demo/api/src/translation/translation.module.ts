import { Module } from "@nestjs/common";
import { ConfigModule } from "@src/config/config.module.js";

import { TranslationService } from "./translation.service.js";

@Module({
    imports: [ConfigModule],
    providers: [TranslationService],
    exports: [TranslationService],
})
export class TranslationModule {}
