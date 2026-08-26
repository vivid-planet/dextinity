import { SortDirection } from "@dextinity/cms-api";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

enum EmailCampaignSortField {
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    title = "title",
    subject = "subject",
    scheduledAt = "scheduledAt",
}
registerEnumType(EmailCampaignSortField, {
    name: "EmailCampaignSortField",
});

@InputType()
export class EmailCampaignSort {
    @Field(() => EmailCampaignSortField)
    @IsEnum(EmailCampaignSortField)
    field: EmailCampaignSortField;

    @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
    @IsEnum(SortDirection)
    direction: SortDirection = SortDirection.ASC;
}
