import type { Block } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { type DynamicModule, Module, type Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module.js";
import type { BrevoConfigInterface } from "../brevo-config/entities/brevo-config-entity.factory.js";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service.js";
import { ConfigModule } from "../config/config.module.js";
import type { TargetGroupInterface } from "../target-group/entity/target-group-entity.factory.js";
import type { EmailCampaignScopeInterface } from "../types.js";
import { EmailCampaignInputFactory } from "./dto/email-campaign-input.factory.js";
import { createEmailCampaignsResolver } from "./email-campaign.resolver.js";
import { EmailCampaignsService } from "./email-campaigns.service.js";
import type { EmailCampaignInterface } from "./entities/email-campaign-entity.factory.js";

interface EmailCampaignModuleConfig {
    Scope: Type<EmailCampaignScopeInterface>;
    EmailCampaignContentBlock: Block;
    BrevoTargetGroup: Type<TargetGroupInterface>;
    BrevoEmailCampaign: Type<EmailCampaignInterface>;
    BrevoConfig: Type<BrevoConfigInterface>;
}

@Module({})
export class EmailCampaignModule {
    static register({
        Scope,
        EmailCampaignContentBlock,
        BrevoTargetGroup,
        BrevoEmailCampaign,
        BrevoConfig,
    }: EmailCampaignModuleConfig): DynamicModule {
        const [EmailCampaignInput, EmailCampaignUpdateInput] = EmailCampaignInputFactory.create({ EmailCampaignContentBlock });
        const EmailCampaignsResolver = createEmailCampaignsResolver({
            BrevoEmailCampaign,
            EmailCampaignInput,
            EmailCampaignUpdateInput,
            Scope,
            BrevoTargetGroup,
        });

        return {
            module: EmailCampaignModule,
            imports: [ConfigModule, BrevoApiModule, MikroOrmModule.forFeature([BrevoEmailCampaign, BrevoTargetGroup, BrevoConfig])],
            providers: [EmailCampaignsResolver, EmailCampaignsService, EcgRtrListService],
        };
    }
}
