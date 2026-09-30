import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import { DateTimeFilter } from "../../common/filter/date-time.filter";
import { IdFilter } from "../../common/filter/id.filter";
import { NumberFilter } from "../../common/filter/number.filter";
import { StringFilter } from "../../common/filter/string.filter";
import { IsUndefinable } from "../../common/validators/is-undefinable";
import { ContentScope } from "../../user-permissions/interfaces/content-scope.interface";

@InputType({ isAbstract: true })
class ActionLogScopeFilter {
    @Field(() => [GraphQLJSONObject], { nullable: true })
    @IsOptional()
    isAnyOf?: ContentScope[];

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    equal?: ContentScope;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    notEqual?: ContentScope;

    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    isGlobal?: boolean;
}

@InputType()
export class ActionLogFilter {
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    @IsUndefinable()
    userId?: StringFilter;

    @Field(() => IdFilter, { nullable: true })
    @ValidateNested()
    @Type(() => IdFilter)
    @IsUndefinable()
    entityId?: IdFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @Type(() => StringFilter)
    @IsUndefinable()
    entityName?: StringFilter;

    @Field(() => NumberFilter, { nullable: true })
    @ValidateNested()
    @Type(() => NumberFilter)
    @IsUndefinable()
    version?: NumberFilter;

    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @Type(() => DateTimeFilter)
    @IsUndefinable()
    createdAt?: DateTimeFilter;

    @Field(() => ActionLogScopeFilter, { nullable: true })
    @IsOptional()
    scope?: ActionLogScopeFilter;

    @Field(() => [ActionLogFilter], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => ActionLogFilter)
    @IsUndefinable()
    and?: ActionLogFilter[];

    @Field(() => [ActionLogFilter], { nullable: true })
    @ValidateNested({ each: true })
    @Type(() => ActionLogFilter)
    @IsUndefinable()
    or?: ActionLogFilter[];
}
