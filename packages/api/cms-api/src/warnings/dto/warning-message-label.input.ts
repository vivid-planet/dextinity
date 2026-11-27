import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class WarningMessageLabelInput {
    @Field()
    @IsString()
    message: string;

    @Field()
    @IsString()
    label: string;
}
