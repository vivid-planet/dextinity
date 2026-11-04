import { Inject } from "@nestjs/common";
import { Args, ArgsType, Field, Mutation, Resolver } from "@nestjs/graphql";
import { IsLocale, IsUUID } from "class-validator";

import { IsUndefinable } from "../common/validators/is-undefinable";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { CONTENT_GENERATION_SERVICE } from "./content-generation.constants";
import { ContentGenerationServiceInterface } from "./content-generation-service.interface";

@ArgsType()
class GenerateAltTextArgs {
    @IsUUID()
    @Field(() => String)
    fileId: string;

    @IsUndefinable()
    @IsLocale()
    @Field(() => String, { nullable: true })
    language?: string;
}

@Resolver()
export class GenerateAltTextResolver {
    @Inject(CONTENT_GENERATION_SERVICE) private contentGenerationService: ContentGenerationServiceInterface;

    @RequiredPermission(["dam"], { skipScopeCheck: true })
    @Mutation(() => String)
    async generateAltText(@Args() { fileId, language }: GenerateAltTextArgs): Promise<string> {
        const altText = await this.contentGenerationService.generateAltText?.(fileId, { language: language ?? "en" });
        if (!altText) {
            throw new Error("Alt text generation failed or is not supported");
        }
        return altText;
    }
}
