import { ScopeInterface } from "@dextinity/cms-api";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Module, Type } from "@nestjs/common";

import { BrevoApiModule } from "../brevo-api/brevo-api.module";
import { ConfigModule } from "../config/config.module";
import { BrevoContactFilterAttributesInterface } from "../types";
import { TargetGroupInputFactory } from "./dto/target-group-input.factory";
import { TargetGroupInterface } from "./entity/target-group-entity.factory";
import { createTargetGroupsResolver } from "./target-group.resolver";
import { TargetGroupsService } from "./target-groups.service";

interface TargetGroupModuleConfig {
    Scope: Type<ScopeInterface>;
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
            imports: [ConfigModule, BrevoApiModule, MikroOrmModule.forFeature(["BrevoTargetGroup"])],
            providers: [TargetGroupResolver, TargetGroupsService],
            exports: [TargetGroupsService],
        };
    }
}
