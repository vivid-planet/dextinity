import { Block } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module, Type } from "@nestjs/common";
import { BrevoConfigInterface } from "src/brevo-config/entities/brevo-config-entity.factory";
import { TargetGroupInterface } from "src/target-group/entity/target-group-entity.factory";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { EcgRtrListService } from "../brevo-contact/ecg-rtr-list/ecg-rtr-list.service";
import { ConfigModule } from "../config/config.module";
import { EmailCampaignScopeInterface } from "../types";
import { EmailCampaignInputFactory } from "./dto/email-campaign-input.factory";
import { createEmailCampaignsResolver } from "./email-campaign.resolver";
import { EmailCampaignsService } from "./email-campaigns.service";
import { EmailCampaignInterface } from "./entities/email-campaign-entity.factory";

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
            imports: [
                ConfigModule,
                BrevoApiModule,
                HttpModule.register({
                    timeout: 5000,
                }),
                MikroOrmModule.forFeature([BrevoEmailCampaign, BrevoTargetGroup, BrevoConfig]),
            ],
            providers: [EmailCampaignsResolver, EmailCampaignsService, EcgRtrListService],
        };
    }
}
