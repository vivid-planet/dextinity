import { DependenciesResolverFactory } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { FooterScope } from "./dto/footer-scope";
import { Footer } from "./entities/footer.entity";
import { FooterResolver } from "./generated/footer.resolver";
import { FootersService } from "./generated/footers.service";

@Module({
    imports: [MikroOrmModule.forFeature([Footer, FooterScope])],
    providers: [FootersService, FooterResolver, DependenciesResolverFactory.create(Footer)],
})
export class FooterModule {}
