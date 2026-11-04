import { Type } from "@nestjs/common";
import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, ValidateNested, ValidationArguments } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import { Block, BlockInputInterface, ExtractBlockInput } from "../../blocks/block";
import { RedirectGenerationType, RedirectSourceType } from "../redirects.enum";
import { IsValidRedirectSource } from "../validators/isValidRedirectSource";

export interface RedirectInputInterface {
    sourceType: RedirectSourceType;
    source: string;
    target: BlockInputInterface;
    comment?: string;
    active?: boolean;
    generationType: RedirectGenerationType;
}

export interface RedirectValidationArguments extends ValidationArguments {
    object: RedirectInputInterface;
}

export class RedirectInputFactory {
    static create({ linkBlock }: { linkBlock: Block }): Type<RedirectInputInterface> {
        @InputType()
        class RedirectInput implements RedirectInputInterface {
            @IsEnum(RedirectSourceType)
            @Field(() => RedirectSourceType)
            sourceType: RedirectSourceType;

            @IsValidRedirectSource()
            @Field()
            source: string;

            @Transform(({ value }) => linkBlock.blockInputFactory(value), { toClassOnly: true })
            @ValidateNested()
            @Field(() => GraphQLJSONObject)
            target: ExtractBlockInput<typeof linkBlock>;

            @IsOptional()
            @Field({ nullable: true })
            comment?: string;

            @IsOptional()
            @Field({ nullable: true })
            active?: boolean;

            @IsEnum(RedirectGenerationType)
            @Field(() => RedirectGenerationType)
            generationType: RedirectGenerationType;
        }

        return RedirectInput;
    }
}
