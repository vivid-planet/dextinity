import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { BuildTemplatesResolver } from "./build-templates.resolver.js";
import { BuildTemplatesService } from "./build-templates.service.js";
import { BuildsResolver } from "./builds.resolver.js";
import { BuildsService } from "./builds.service.js";
import { ChangesCheckerCommand } from "./changes-checker.command.js";
import { ChangesCheckerInterceptor } from "./changes-checker.interceptor.js";
import { ChangesSinceLastBuild } from "./entities/changes-since-last-build.entity.js";

@Module({
    imports: [MikroOrmModule.forFeature([ChangesSinceLastBuild])],
    providers: [
        BuildTemplatesResolver,
        BuildTemplatesService,
        BuildsResolver,
        BuildsService,
        {
            provide: "APP_INTERCEPTOR",
            useClass: ChangesCheckerInterceptor,
        },
        ChangesCheckerCommand,
    ],
    exports: [BuildsService],
})
export class BuildsModule {}
