import { Inject } from "@nestjs/common";
import { Args, ArgsType, Field, Mutation, Resolver } from "@nestjs/graphql";
import { IsLocale, IsUUID } from "class-validator";

import { IsUndefinable } from "../common/validators/is-undefinable";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CONTENT_GENERATION_SERVICE } from "./content-generation.constants";
import { ContentGenerationServiceInterface } from "./content-generation-service.interface";

@ArgsType()
class GenerateImageTitleArgs {
    @IsUUID()
    @Field(() => String)
    fileId: string;

    @IsUndefinable()
    @IsLocale()
    @Field(() => String, { nullable: true })
    language?: string;
}

@Resolver()
export class GenerateImageTitleResolver {
    @Inject(CONTENT_GENERATION_SERVICE) private contentGenerationService: ContentGenerationServiceInterface;

    @RequiredPermission(["dam"], { skipScopeCheck: true })
    @Mutation(() => String)
    async generateImageTitle(@Args() { fileId, language }: GenerateImageTitleArgs): Promise<string> {
        const imageTitle = await this.contentGenerationService.generateImageTitle?.(fileId, { language: language ?? "en" });
        if (!imageTitle) {
            throw new Error("Image title generation failed or is not supported");
        }
        return imageTitle;
    }
}
