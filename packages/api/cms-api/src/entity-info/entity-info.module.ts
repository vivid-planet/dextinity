import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { EntityInfoObject } from "./entity-info.object.js";
import { EntityInfoService } from "./entity-info.service.js";

@Module({
    imports: [MikroOrmModule.forFeature([EntityInfoObject])],
    providers: [EntityInfoService],
    exports: [EntityInfoService],
})
export class EntityInfoModule {}
