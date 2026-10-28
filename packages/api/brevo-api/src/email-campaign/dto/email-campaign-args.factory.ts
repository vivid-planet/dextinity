import { OffsetBasedPaginationArgs } from "@dextinity/cms-api";
import type { Type } from "@nestjs/common";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import type { EmailCampaignScopeInterface } from "../../types.js";
import { EmailCampaignFilter } from "./email-campaign.filter.js";
import { EmailCampaignSort } from "./email-campaign.sort.js";

export class EmailCampaignArgsFactory {
    static create({ Scope }: { Scope: Type<EmailCampaignScopeInterface> }) {
        @ArgsType()
        class EmailCampaignArgs extends OffsetBasedPaginationArgs {
            @Field(() => Scope)
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: EmailCampaignScopeInterface;

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
