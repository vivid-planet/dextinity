import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsBoolean, ValidateNested } from "class-validator";

import { DateTimeFilter } from "../../common/filter/date-time.filter.js";
import { IdFilter } from "../../common/filter/id.filter.js";
import { NumberFilter } from "../../common/filter/number.filter.js";
import { ScopeFilter } from "../../common/filter/scope.filter.js";
import { StringFilter } from "../../common/filter/string.filter.js";
import { IsNullable } from "../../common/validators/is-nullable.js";
import { IsUndefinable } from "../../common/validators/is-undefinable.js";

@InputType({ isAbstract: true })
class ActionLogScopeFilter extends ScopeFilter {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsNullable()
    @IsUndefinable()
    isGlobal?: boolean | null;
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
    @ValidateNested()
    @Type(() => ActionLogScopeFilter)
    @IsUndefinable()
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
