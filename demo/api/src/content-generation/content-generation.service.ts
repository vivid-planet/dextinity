import { AzureOpenAiContentGenerationService, ContentGenerationServiceInterface } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ContentGenerationService implements ContentGenerationServiceInterface {
    constructor(private readonly openAiContentGenerationService: AzureOpenAiContentGenerationService) {}

    async generateAltText(fileId: string, options?: { language: string }) {
        return this.openAiContentGenerationService.generateAltText(fileId, options);
    }

    async generateImageTitle(fileId: string, options?: { language: string }) {
        return this.openAiContentGenerationService.generateImageTitle(fileId, options);
    }

    async generateSeoTags(content: string, options: { language: string }) {
        return this.openAiContentGenerationService.generateSeoTags(content, options);
    }
}
