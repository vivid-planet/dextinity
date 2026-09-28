import { createEnumFilter, DateTimeFilter, StringFilter } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { SendingState } from "../sending-state.enum";

@InputType()
class SendingStateEnumFilter extends createEnumFilter(SendingState) {}

@InputType()
export class EmailCampaignFilter {
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
    title?: StringFilter;

    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    subject?: StringFilter;

    @Field(() => SendingStateEnumFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => SendingStateEnumFilter)
    sendingState?: SendingStateEnumFilter;

    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    scheduledAt?: DateTimeFilter;

    @Field(() => [EmailCampaignFilter], { nullable: true })
    @Type(() => EmailCampaignFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: EmailCampaignFilter[];

    @Field(() => [EmailCampaignFilter], { nullable: true })
    @Type(() => EmailCampaignFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: EmailCampaignFilter[];
}
