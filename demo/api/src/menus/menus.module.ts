import { DependenciesResolverFactory } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { PagesModule } from "@src/documents/pages/pages.module.js";

import { MainMenuItem } from "./entities/main-menu-item.entity.js";
import { MainMenuItemResolver } from "./main-menu-item.resolver.js";
import { MenusResolver } from "./menus.resolver.js";

@Module({
    imports: [PagesModule, MikroOrmModule.forFeature([MainMenuItem])],
    providers: [MenusResolver, MainMenuItemResolver, DependenciesResolverFactory.create(MainMenuItem)],
})
export class MenusModule {}
