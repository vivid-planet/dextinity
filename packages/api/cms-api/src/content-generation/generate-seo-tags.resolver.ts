import { Inject } from "@nestjs/common";
import { Args, ArgsType, Field, Mutation, Resolver } from "@nestjs/graphql";
import { IsLocale, IsString } from "class-validator";

import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator.js";
import { CONTENT_GENERATION_SERVICE } from "./content-generation.constants.js";
import { type ContentGenerationServiceInterface, SeoTags } from "./content-generation-service.interface.js";

@ArgsType()
class GenerateSeoTagsArgs {
    @IsString()
    @Field(() => String)
    content: string;

    @IsLocale()
    @Field(() => String)
    language: string;
}

@Resolver()
export class GenerateSeoTagsResolver {
    @Inject(CONTENT_GENERATION_SERVICE) private contentGenerationService: ContentGenerationServiceInterface;

    @RequiredPermission(["pageTree"], { skipScopeCheck: true })
    @Mutation(() => SeoTags)
    async generateSeoTags(@Args() { content, language }: GenerateSeoTagsArgs): Promise<SeoTags> {
        const seoTags = await this.contentGenerationService.generateSeoTags?.(content, { language });
        if (!seoTags) {
            throw new Error("SEO tag generation failed or is not supported");
        }
        return seoTags;
    }
}
