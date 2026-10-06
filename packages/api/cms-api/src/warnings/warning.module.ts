import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { EntityInfoModule } from "../entity-info/entity-info.module.js";
import { Warning } from "./entities/warning.entity.js";
import { WarningResolver } from "./warning.resolver.js";
import { WarningService } from "./warning.service.js";
import { WarningCheckerCommand } from "./warning-checker.command.js";
import { WarningEventSubscriber } from "./warning-event-subscriber.js";

@Module({
    imports: [MikroOrmModule.forFeature([Warning]), EntityInfoModule],
    providers: [WarningResolver, WarningCheckerCommand, WarningService, WarningEventSubscriber],
    exports: [WarningService],
})
export class WarningsModule {}
