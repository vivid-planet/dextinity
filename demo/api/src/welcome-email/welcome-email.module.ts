import { DependenciesResolverFactory } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { WelcomeEmailScope } from "./dto/welcome-email-scope.js";
import { WelcomeEmail } from "./entities/welcome-email.entity.js";
import { WelcomeEmailResolver } from "./generated/welcome-email.resolver.js";
import { WelcomeEmailsService } from "./generated/welcome-emails.service.js";
import { WelcomeEmailTestMailResolver } from "./welcome-email-test-mail.resolver.js";

@Module({
    imports: [MikroOrmModule.forFeature([WelcomeEmail, WelcomeEmailScope])],
    providers: [WelcomeEmailsService, WelcomeEmailResolver, WelcomeEmailTestMailResolver, DependenciesResolverFactory.create(WelcomeEmail)],
})
export class WelcomeEmailModule {}
