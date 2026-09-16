import { OffsetBasedPaginationArgs, ScopeInterface } from "@dextinity/cms-api";
import { Type } from "@nestjs/common";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { EmailCampaignFilter } from "./email-campaign.filter";
import { EmailCampaignSort } from "./email-campaign.sort";

export class EmailCampaignArgsFactory {
    static create({ Scope }: { Scope: Type<ScopeInterface> }) {
        @ArgsType()
        class EmailCampaignArgs extends OffsetBasedPaginationArgs {
            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: ScopeInterface;

            @Field({ nullable: true })
            @IsOptional()
            @IsString()
            search?: string;

            @Field(() => EmailCampaignFilter, { nullable: true })
            @ValidateNested()
            @TransformerType(() => EmailCampaignFilter)
            @IsOptional()
            filter?: EmailCampaignFilter;

            @Field(() => [EmailCampaignSort], { nullable: true })
            @ValidateNested({ each: true })
            @TransformerType(() => EmailCampaignSort)
            @IsOptional()
            sort?: EmailCampaignSort[];
        }

        return EmailCampaignArgs;
    }
}
