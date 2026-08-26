import { PartialType } from "@dextinity/cms-api";
import { Field, InputType, Int } from "@nestjs/graphql";
import { IsAlphanumeric, IsEmail, IsInt, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";

@InputType()
export class BrevoConfigInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    @IsEmail()
    senderMail: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    senderName: string;

    @IsInt()
    @Field(() => Int)
    doubleOptInTemplateId: number;

    @Field(() => Int)
    @IsInt()
    folderId: number;

    @IsNotEmpty()
    @Field()
    @IsUrl({ require_tld: process.env.NODE_ENV === "production" })
    allowedRedirectionUrl: string;

    @IsString()
    @Field()
    @Length(24)
    @IsAlphanumeric()
    unsubscriptionPageId: string;
}

@InputType()
export class BrevoConfigUpdateInput extends PartialType(BrevoConfigInput) {}
