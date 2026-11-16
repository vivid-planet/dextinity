import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { PredefinedPage } from "./entities/predefined-page.entity.js";
import { PredefinedPagesResolver } from "./predefined-pages.resolver.js";
import { PredefinedPagesService } from "./predefined-pages.service.js";

@Module({
    imports: [MikroOrmModule.forFeature([PredefinedPage])],
    providers: [PredefinedPagesResolver, PredefinedPagesService],
    exports: [PredefinedPagesService],
})
export class PredefinedPagesModule {}
