import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { BooleanFilter } from "../../common/filter/boolean.filter";
import { DateTimeFilter } from "../../common/filter/date-time.filter";
import { createEnumFilter } from "../../common/filter/enum.filter.factory";
import { ScopeFilter } from "../../common/filter/scope.filter";
import { StringFilter } from "../../common/filter/string.filter";
import { WarningSeverity } from "../entities/warning-severity.enum";
import { WarningStatus } from "../entities/warning-status.enum";

@InputType()
class WarningSeverityEnumFilter extends createEnumFilter(WarningSeverity) {}
@InputType()
class WarningStatusEnumFilter extends createEnumFilter(WarningStatus) {}

@InputType()
export class WarningFilter {
    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    updatedAt?: DateTimeFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    message?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    type?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    name?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    secondaryInformation?: StringFilter;

    @Field(() => BooleanFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => BooleanFilter)
    visible?: BooleanFilter;

    @Field(() => WarningSeverityEnumFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => WarningSeverityEnumFilter)
    severity?: WarningSeverityEnumFilter;

    @Field(() => WarningStatusEnumFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => WarningStatusEnumFilter)
    status?: WarningStatusEnumFilter;

    @Field(() => ScopeFilter, { nullable: true })
    @IsOptional()
    scope?: ScopeFilter;

    @Field(() => [WarningFilter], { nullable: true })
    @Type(() => WarningFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: WarningFilter[];

    @Field(() => [WarningFilter], { nullable: true })
    @Type(() => WarningFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: WarningFilter[];
}
