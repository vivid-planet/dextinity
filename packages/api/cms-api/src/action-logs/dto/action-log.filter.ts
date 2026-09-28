import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

import { DateTimeFilter } from "../../common/filter/date-time.filter";
import { IdFilter } from "../../common/filter/id.filter";
import { NumberFilter } from "../../common/filter/number.filter";
import { StringFilter } from "../../common/filter/string.filter";
import { IsUndefinable } from "../../common/validators/is-undefinable";

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
