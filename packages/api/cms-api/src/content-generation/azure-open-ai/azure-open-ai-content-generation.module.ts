import { type DynamicModule, Global, Module } from "@nestjs/common";

import { AZURE_OPEN_AI_CONTENT_GENERATION_SERVICE_CONFIG } from "./azure-open-ai.constants.js";
import { AzureOpenAiContentGenerationService, type AzureOpenAiContentGenerationServiceConfig } from "./azure-open-ai-content-generation.service.js";

@Global()
@Module({})
export class AzureOpenAiContentGenerationModule {
    static register(config: AzureOpenAiContentGenerationServiceConfig): DynamicModule {
        return {
            module: AzureOpenAiContentGenerationModule,
            providers: [
                {
                    provide: AZURE_OPEN_AI_CONTENT_GENERATION_SERVICE_CONFIG,
                    useValue: config,
                },
                AzureOpenAiContentGenerationService,
            ],
            exports: [AzureOpenAiContentGenerationService],
        };
    }
}
