import { Field, ID, InputType } from "@nestjs/graphql";
import { IsBoolean, IsNotEmpty, IsUUID } from "class-validator";

@InputType()
export class ProductTagNestedProductToTagInput {
    @IsNotEmpty()
    @Field(() => ID)
    @IsUUID()
    product: string;
    @IsNotEmpty()
    @IsBoolean()
    @Field({ defaultValue: true })
    exampleStatus: boolean;
}
