import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";
import { ContentScope } from "src/user-permissions/interfaces/content-scope.interface";

import { DateTimeFilter } from "../../common/filter/date-time.filter";
import { createEnumFilter } from "../../common/filter/enum.filter.factory";
import { StringFilter } from "../../common/filter/string.filter";
import { WarningSeverity } from "../entities/warning-severity.enum";
import { WarningStatus } from "../entities/warning-status.enum";

@InputType()
class WarningSeverityEnumFilter extends createEnumFilter(WarningSeverity) {}
@InputType()
class WarningStatusEnumFilter extends createEnumFilter(WarningStatus) {}

@InputType({ isAbstract: true })
class ScopeFilter {
    @Field(() => [GraphQLJSONObject], { nullable: true })
    @IsOptional()
    isAnyOf?: ContentScope[];

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    equal?: ContentScope;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    notEqual?: ContentScope;
}

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
