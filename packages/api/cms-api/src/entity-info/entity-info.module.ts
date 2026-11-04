import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { EntityInfoObject } from "./entity-info.object";
import { EntityInfoService } from "./entity-info.service";

@Module({
    imports: [MikroOrmModule.forFeature([EntityInfoObject])],
    providers: [EntityInfoService],
    exports: [EntityInfoService],
})
export class EntityInfoModule {}
