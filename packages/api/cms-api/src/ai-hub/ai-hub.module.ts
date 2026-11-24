import { type DynamicModule, Module } from "@nestjs/common";

import { AI_HUB_CONFIG, type AiHubConfig } from "./ai-hub.config.js";
import { AiHubController } from "./ai-hub.controller.js";

@Module({})
export class AiHubModule {
    static register(config: AiHubConfig): DynamicModule {
        return {
            module: AiHubModule,
            controllers: [AiHubController],
            providers: [{ provide: AI_HUB_CONFIG, useValue: config }],
        };
    }
}
