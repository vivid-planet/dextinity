import { Field, InputType } from "@nestjs/graphql";
import { ArrayNotEmpty, IsNotEmpty, IsString } from "class-validator";

@InputType()
export class AzureAiTranslationBatchInput {
    @ArrayNotEmpty()
    @IsString({ each: true })
    @Field(() => [String])
    texts: string[];

    @IsNotEmpty()
    @IsString()
    @Field()
    targetLanguage: string;
}
