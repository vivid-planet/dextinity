import { type DynamicModule, Module, type Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module.js";
import { ConfigModule } from "../config/config.module.js";
import type { BrevoContactFilterAttributesInterface, EmailCampaignScopeInterface } from "../types.js";
import { TargetGroupInputFactory } from "./dto/target-group-input.factory.js";
import type { TargetGroupInterface } from "./entity/target-group-entity.factory.js";
import { createTargetGroupsResolver } from "./target-group.resolver.js";
import { TargetGroupsService } from "./target-groups.service.js";

interface TargetGroupModuleConfig {
    Scope: Type<EmailCampaignScopeInterface>;
    BrevoFilterAttributes?: Type<BrevoContactFilterAttributesInterface>;
    BrevoTargetGroup: Type<TargetGroupInterface>;
}

@Module({})
export class TargetGroupModule {
    static register({ Scope, BrevoFilterAttributes, BrevoTargetGroup }: TargetGroupModuleConfig): DynamicModule {
        const [TargetGroupInput, TargetGroupUpdateInput] = TargetGroupInputFactory.create({ BrevoFilterAttributes });
        const TargetGroupResolver = createTargetGroupsResolver({
            BrevoTargetGroup,
            TargetGroupInput,
            TargetGroupUpdateInput,
            Scope,
        });

        return {
            module: TargetGroupModule,
            imports: [ConfigModule, BrevoApiModule],
            providers: [TargetGroupResolver, TargetGroupsService],
            exports: [TargetGroupsService],
        };
    }
}
