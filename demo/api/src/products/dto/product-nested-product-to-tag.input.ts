import { Field, ID, InputType } from "@nestjs/graphql";
import { IsBoolean, IsNotEmpty, IsUUID } from "class-validator";

@InputType()
export class ProductNestedProductToTagInput {
    @IsNotEmpty()
    @Field(() => ID)
    @IsUUID()
    tag: string;
    @IsNotEmpty()
    @IsBoolean()
    @Field({ defaultValue: true })
    exampleStatus: boolean;
}
