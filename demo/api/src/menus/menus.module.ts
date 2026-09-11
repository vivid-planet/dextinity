import { DependenciesResolverFactory } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { PagesModule } from "@src/documents/pages/pages.module";

import { MainMenuItem } from "./entities/main-menu-item.entity";
import { MainMenuItemResolver } from "./main-menu-item.resolver";
import { MenusResolver } from "./menus.resolver";

@Module({
    imports: [PagesModule, MikroOrmModule.forFeature([MainMenuItem])],
    providers: [MenusResolver, MainMenuItemResolver, DependenciesResolverFactory.create(MainMenuItem)],
})
export class MenusModule {}
