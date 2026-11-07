import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { Link } from "./entities/link.entity.js";
import { LinksResolver } from "./links.resolver.js";

@Module({
    imports: [MikroOrmModule.forFeature([Link])],
    providers: [LinksResolver],
})
export class LinksModule {}
