import { Field, ID, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

import { PartialType } from "../../../../common/helper/partial-type.helper.js";
import { IsUndefinable } from "../../../../common/validators/is-undefinable.js";
import { DamMediaAlternativeType } from "../entities/dam-media-alternative.entity.js";

@InputType()
export class DamMediaAlternativeInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    language: string;

    @IsNotEmpty()
    @IsEnum(DamMediaAlternativeType)
    @Field(() => DamMediaAlternativeType)
    type: DamMediaAlternativeType;
}

@InputType()
export class DamMediaAlternativeUpdateInput extends PartialType(DamMediaAlternativeInput) {
    @Field(() => ID, { nullable: true })
    @IsUndefinable()
    @IsString()
    for?: string;

    @Field(() => ID, { nullable: true })
    @IsUndefinable()
    @IsString()
    alternative?: string;
}
