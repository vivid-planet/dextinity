import createClient, { isUnexpected, type TextTranslationClient } from "@azure-rest/ai-translation-text";
import { Inject } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator.js";
import type { AzureAiTranslatorConfig } from "./azure-ai-translator.config.js";
import { AZURE_AI_TRANSLATOR_CONFIG } from "./azure-ai-translator.constants.js";
import { AzureAiTranslationInput } from "./dto/azure-ai-translation.input.js";
import { AzureAiTranslationBatchInput } from "./dto/azure-ai-translation-batch.input.js";

// Azure Translator API limits: max 25 texts and 50,000 characters per request
const AZURE_BATCH_SIZE = 25;

@Resolver()
@RequiredPermission(["translation"], { skipScopeCheck: true })
export class AzureAiTranslatorResolver {
    private readonly translationClient: TextTranslationClient;

    constructor(@Inject(AZURE_AI_TRANSLATOR_CONFIG) private readonly config: AzureAiTranslatorConfig) {
        this.translationClient = createClient(config.endpoint, {
            key: config.key,
            region: config.region,
        });
    }

    @Query(() => String)
    async azureAiTranslate(@Args("input") input: AzureAiTranslationInput): Promise<string> {
        const translateResponse = await this.translationClient.path("/translate").post({
            body: [{ text: input.text }],
            queryParameters: {
                to: input.targetLanguage,
                textType: "html",
            },
        });

        if (isUnexpected(translateResponse)) {
            // https://learn.microsoft.com/en-us/azure/ai-services/translator/reference/v3-0-reference#errors
            if (translateResponse.body.error.code === 403001) {
                throw new Error("Translation failed. Exceeded free quota.");
            } else if (translateResponse.status === "429") {
                throw new Error("Translation failed. Exceeded request limit.");
            }

            throw new Error(
                `Translation failed. Status: ${JSON.stringify(translateResponse.status)} Response Body: ${JSON.stringify(translateResponse.body)}`,
            );
        }

        const result = translateResponse.body[0].translations[0].text;
        return result;
    }

    @Query(() => [String])
    async azureAiTranslateBatch(@Args("input") input: AzureAiTranslationBatchInput): Promise<string[]> {
        const results: string[] = [];

        // Chunk texts to stay within Azure API limits
        for (let i = 0; i < input.texts.length; i += AZURE_BATCH_SIZE) {
            const chunk = input.texts.slice(i, i + AZURE_BATCH_SIZE);

            const translateResponse = await this.translationClient.path("/translate").post({
                body: chunk.map((text) => ({ text })),
                queryParameters: {
                    to: input.targetLanguage,
                    textType: "html",
                },
            });

            if (isUnexpected(translateResponse)) {
                if (translateResponse.body.error.code === 403001) {
                    throw new Error("Translation failed. Exceeded free quota.");
                } else if (translateResponse.status === "429") {
                    throw new Error("Translation failed. Exceeded request limit.");
                }

                throw new Error(
                    `Translation failed. Status: ${JSON.stringify(translateResponse.status)} Response Body: ${JSON.stringify(translateResponse.body)}`,
                );
            }

            for (const item of translateResponse.body) {
                results.push(item.translations[0].text);
            }
        }

        return results;
    }
}
