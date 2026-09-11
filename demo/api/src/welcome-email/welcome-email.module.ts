import { DependenciesResolverFactory } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { WelcomeEmailScope } from "./dto/welcome-email-scope";
import { WelcomeEmail } from "./entities/welcome-email.entity";
import { WelcomeEmailResolver } from "./generated/welcome-email.resolver";
import { WelcomeEmailsService } from "./generated/welcome-emails.service";
import { WelcomeEmailTestMailResolver } from "./welcome-email-test-mail.resolver";

@Module({
    imports: [MikroOrmModule.forFeature([WelcomeEmail, WelcomeEmailScope])],
    providers: [WelcomeEmailsService, WelcomeEmailResolver, WelcomeEmailTestMailResolver, DependenciesResolverFactory.create(WelcomeEmail)],
})
export class WelcomeEmailModule {}
