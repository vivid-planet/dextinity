import { Inject, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import type { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { FilesService } from "../../dam/files/files.service";
import { ContentGenerationServiceInterface, SeoTags } from "../content-generation-service.interface";
import { AZURE_OPEN_AI_CONTENT_GENERATION_SERVICE_CONFIG } from "./azure-open-ai.constants";

export type AzureOpenAiContentGenerationServiceConfig = AzureOpenAiConfig | ConfigByMethod;

export type AzureOpenAiConfig = {
    deploymentId: string;
    apiKey: string;
    apiUrl: string;
    apiVersion?: string;
};

type ConfigByMethod = Partial<Record<ServiceMethods, AzureOpenAiConfig>>;

type ServiceMethods = Extract<keyof AzureOpenAiContentGenerationService, keyof ContentGenerationServiceInterface>;

function isAzureOpenAiContentGenerationConfig(config: AzureOpenAiContentGenerationServiceConfig): config is AzureOpenAiConfig {
    return "apiKey" in config;
}

@Injectable()
export class AzureOpenAiContentGenerationService implements ContentGenerationServiceInterface {
    constructor(
        private readonly filesService: FilesService,
        @Inject(AZURE_OPEN_AI_CONTENT_GENERATION_SERVICE_CONFIG) private readonly config: AzureOpenAiContentGenerationServiceConfig,
    ) {}

    private getConfigForMethod(name: ServiceMethods): AzureOpenAiConfig {
        if (isAzureOpenAiContentGenerationConfig(this.config)) {
            return this.config;
        }

        const config = this.config[name];
        if (!config) {
            throw new Error(`Missing config for method ${name}`);
        }
        return config;
    }

    private async createClient(config: AzureOpenAiConfig): Promise<AzureOpenAI> {
        // Imported lazily so importing @dextinity/cms-api doesn't pull the openai package into
        // memory unless the content-generation feature is actually used.
        const { AzureOpenAI } = await import("openai");
        return new AzureOpenAI({
            apiKey: config.apiKey,
            deployment: config.deploymentId,
            apiVersion: config.apiVersion ?? "2024-03-01-preview",
            endpoint: config.apiUrl,
        });
    }

    async generateAltText(fileId: string, options?: { language: string }): Promise<string> {
        const language = options?.language ?? "en";
        const config = this.getConfigForMethod("generateAltText");

        const file = await this.filesService.findOneById(fileId);

        if (file === null) {
            throw new Error("File doesn't exist");
        }

        const client = await this.createClient(config);
        const prompt: Array<ChatCompletionMessageParam> = [
            {
                role: "system",
                content: `You are an expert in writing alternative text for HTML images. The user will provide you with an image and your job is to provide an alternative text for this image. This text should help visually impaired users understand the content of the image. Keep yourself to a short description, ideally 3 sentences or less. Don't put the text in quotation marks. Answer in the language "${language}".`,
            },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: await this.filesService.getFileAsBase64String(file),
                            detail: "low",
                        },
                    },
                ],
            },
        ];

        const result = await client.chat.completions.create({ messages: prompt, model: "", max_completion_tokens: 300 });
        return result.choices[0].message?.content ?? "";
    }

    async generateImageTitle(fileId: string, options?: { language: string }): Promise<string> {
        const language = options?.language ?? "en";
        const config = this.getConfigForMethod("generateImageTitle");

        const file = await this.filesService.findOneById(fileId);

        if (file === null) {
            throw new Error("File doesn't exist");
        }

        const client = await this.createClient(config);
        const prompt: Array<ChatCompletionMessageParam> = [
            {
                role: "system",
                content: `The user will provide you with an image. Write a short text with less than 150 characters that can be displayed in the HTML title attribute of this image. Do not put the title inside quotation marks. Answer in the language "${language}".`,
            },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: await this.filesService.getFileAsBase64String(file),
                            detail: "low",
                        },
                    },
                ],
            },
        ];
        const result = await client.chat.completions.create({ messages: prompt, model: "", max_completion_tokens: 300 });
        return result.choices[0].message?.content ?? "";
    }

    async generateSeoTags(content: string, { language }: { language: string }): Promise<SeoTags> {
        const config = this.getConfigForMethod("generateSeoTags");

        const client = await this.createClient(config);
        const prompt: Array<ChatCompletionMessageParam> = [
            {
                role: "system",
                content: `You are a SEO expert. You will receive a JSON representing the content of a  website. Your task is to generate a SEO-optimized HTML title, meta description, OpenGraph title and OpenGraph description for the website.
                    
                    Return a JSON object with the following format:
                    {
                        "htmlTitle": "",
                        "metaDescription": "",
                        "openGraphTitle": "",
                        "openGraphDescription": "",
                    }
                    
                    Only answer in valid JSON. Don't put the JSON in quotation marks or markdown. Don't include any placeholders. Answer in the language "${language}".
                    `,
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: content,
                    },
                ],
            },
        ];

        let seoTags: SeoTags | undefined;
        let tries = 0;
        do {
            const result = await client.chat.completions.create({ messages: prompt, model: "", max_completion_tokens: 300 });
            tries++;

            const response = result.choices[0].message?.content;

            if (response) {
                try {
                    const json = JSON.parse(response);
                    seoTags = plainToInstance(SeoTags, json);
                    const errors = validateSync(seoTags, { skipMissingProperties: false });

                    if (errors.length > 0) {
                        throw new Error(errors.toString());
                    }
                } catch {
                    seoTags = undefined;
                }
            }
        } while (seoTags === undefined && tries < 3);

        if (seoTags === undefined) {
            throw new Error("Failed to generate SEO tags");
        }

        return seoTags;
    }
}
