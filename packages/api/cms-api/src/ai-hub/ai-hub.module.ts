import { type DynamicModule, Module } from "@nestjs/common";

import { AI_HUB_CONFIG, type AiHubConfig } from "./ai-hub.config.js";
import { AiHubController } from "./ai-hub.controller.js";

/**
 * Serves a proxy at `/ai-hub` for the chat web component of the Dextinity AI Hub, which keeps the widget's secret key on
 * the server and sets the ID of the authenticated user wherever the AI Hub reads one. Users need the `aiHub` permission.
 *
 * The app has to accept JSON bodies of up to 10 MB below the proxy, because the chat sends the whole conversation with
 * every message, and mustn't read its `multipart/form-data` bodies, which the proxy pipes through unread.
 */
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
