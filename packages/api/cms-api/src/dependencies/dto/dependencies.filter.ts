import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

import { BooleanFilter } from "../../common/filter/boolean.filter";
import { StringFilter } from "../../common/filter/string.filter";
import { IsUndefinable } from "../../common/validators/is-undefinable";

@InputType()
export class DependencyFilter {
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    @IsUndefinable()
    targetGraphqlObjectType?: StringFilter;

    @Field({ nullable: true })
    @IsString()
    @IsUndefinable()
    targetId?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefinable()
    rootColumnName?: string;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    @IsUndefinable()
    name?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    @IsUndefinable()
    secondaryInformation?: StringFilter;

    @Field(() => BooleanFilter, { nullable: true })
    @ValidateNested()
    @Type(() => BooleanFilter)
    @IsUndefinable()
    visible?: BooleanFilter;

    @Field(() => [DependencyFilter], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => DependencyFilter)
    @IsUndefinable()
    and?: DependencyFilter[];

    @Field(() => [DependencyFilter], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => DependencyFilter)
    @IsUndefinable()
    or?: DependencyFilter[];
}

@InputType()
export class DependentFilter {
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    @IsUndefinable()
    rootGraphqlObjectType?: StringFilter;

    @Field({ nullable: true })
    @IsString()
    @IsUndefinable()
    rootId?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefinable()
    rootColumnName?: string;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    @IsUndefinable()
    name?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    @IsUndefinable()
    secondaryInformation?: StringFilter;

    @Field(() => BooleanFilter, { nullable: true })
    @ValidateNested()
    @Type(() => BooleanFilter)
    @IsUndefinable()
    visible?: BooleanFilter;

    @Field(() => [DependentFilter], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => DependentFilter)
    @IsUndefinable()
    and?: DependentFilter[];

    @Field(() => [DependentFilter], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => DependentFilter)
    @IsUndefinable()
    or?: DependentFilter[];
}
