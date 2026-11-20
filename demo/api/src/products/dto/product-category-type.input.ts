import { PartialType } from "@dextinity/cms-api";
import { Field, ID, InputType } from "@nestjs/graphql";
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

@InputType()
export class ProductCategoryTypeInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    title: string;
    @Field(() => [ID], { defaultValue: [] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    categories: string[];
}
@InputType()
export class ProductCategoryTypeUpdateInput extends PartialType(ProductCategoryTypeInput) {}
