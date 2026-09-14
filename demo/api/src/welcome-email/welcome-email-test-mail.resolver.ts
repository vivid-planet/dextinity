import { MailerService, RequiredPermission } from "@dextinity/cms-api";
import { Inject } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Config } from "@src/config/config";
import { CONFIG } from "@src/config/config.module";

import { WelcomeEmailScope } from "./dto/welcome-email-scope";
import { WelcomeEmail } from "./entities/welcome-email.entity";

const testMailRecipient = "welcome-email-test@dextinity.com";

@Resolver(() => WelcomeEmail)
@RequiredPermission(["pageTree"])
export class WelcomeEmailTestMailResolver {
    constructor(
        @Inject(CONFIG) private readonly config: Config,
        private readonly mailerService: MailerService,
    ) {}

    @Mutation(() => Boolean)
    async sendWelcomeEmailTestMail(@Args("scope", { type: () => WelcomeEmailScope }) scope: WelcomeEmailScope): Promise<boolean> {
        const siteConfig = this.config.siteConfigs.find((siteConfig) => siteConfig.scope.domain === scope.domain);

        if (!siteConfig) {
            throw new Error(`Site config not found for domain: ${scope.domain}`);
        }

        const renderUrl = new URL(`${siteConfig.url}/api/render-welcome-email`);
        renderUrl.searchParams.set("domain", scope.domain);
        renderUrl.searchParams.set("language", scope.language);

        const response = await fetch(renderUrl);

        if (!response.ok) {
            throw new Error(`Failed to render welcome email for domain "${scope.domain}" (status ${response.status})`);
        }

        await this.mailerService.sendMail({
            to: testMailRecipient,
            subject: "Welcome Email (Test)",
            html: await response.text(),
            mailTypeForLogging: "welcomeEmailTest",
        });

        return true;
    }
}
