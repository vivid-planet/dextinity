import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";

@InputType()
export class DamSettingsInput {
    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsUUID()
    invalidLicenseFallbackImageId?: string;
}
