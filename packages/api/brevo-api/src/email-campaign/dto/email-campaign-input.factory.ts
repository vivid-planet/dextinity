import { Block, BlockInputInterface, isBlockInputInterface, IsNullable, IsUndefinable, RootBlockInputScalar } from "@dextinity/cms-api";
import { Type } from "@nestjs/common";
import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, IsUUID, MinDate, ValidateNested } from "class-validator";

export interface EmailCampaignInputInterface {
    title: string;
    subject: string;
    scheduledAt?: Date | null;
    content: BlockInputInterface;
    brevoTargetGroups: string[];
}

export class EmailCampaignInputFactory {
    static create({
        EmailCampaignContentBlock,
    }: {
        EmailCampaignContentBlock: Block;
    }): [Type<EmailCampaignInputInterface>, Type<Partial<EmailCampaignInputInterface>>] {
        @InputType()
        class EmailCampaignInput implements EmailCampaignInputInterface {
            @IsNotEmpty()
            @IsString()
            @Field()
            title: string;

            @IsNotEmpty()
            @IsString()
            @Field()
            subject: string;

            @IsUndefinable() // When sending undefined, the previous scheduledAt value will be kept
            @IsNullable() // When sending null, the scheduledAt value will be removed
            @IsDate()
            @MinDate(() => new Date())
            @Field(() => Date, { nullable: true })
            scheduledAt?: Date | null;

            @Field(() => [ID])
            @IsUUID(4, { each: true })
            brevoTargetGroups: string[];

            @Field(() => RootBlockInputScalar(EmailCampaignContentBlock))
            @Transform(({ value }) => (isBlockInputInterface(value) ? value : EmailCampaignContentBlock.blockInputFactory(value)), {
                toClassOnly: true,
            })
            @ValidateNested()
            content: BlockInputInterface;
        }

        @InputType()
        class EmailCampaignUpdateInput extends PartialType(EmailCampaignInput) {}

        return [EmailCampaignInput, EmailCampaignUpdateInput];
    }
}
