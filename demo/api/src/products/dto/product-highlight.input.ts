import { PartialType } from "@dextinity/cms-api";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

@InputType()
export class ProductHighlightInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    description: string;
    @IsNotEmpty()
    @Field(() => ID)
    @IsUUID()
    product: string;
}
@InputType()
export class ProductHighlightUpdateInput extends PartialType(ProductHighlightInput) {}
