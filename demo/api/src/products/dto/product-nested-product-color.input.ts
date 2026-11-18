import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class ProductNestedProductColorInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    name: string;
    @IsNotEmpty()
    @IsString()
    @Field()
    hexCode: string;
}
