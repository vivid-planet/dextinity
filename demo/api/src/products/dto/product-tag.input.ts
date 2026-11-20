import { PartialType } from "@dextinity/cms-api";
import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

import { ProductTagNestedProductToTagInput } from "./product-tag-nested-product-to-tag.input.js";

@InputType()
export class ProductTagInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    title: string;
    @Field(() => [ID], { defaultValue: [] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    products: string[];
    @Field(() => [ProductTagNestedProductToTagInput], { defaultValue: [] })
    @IsArray()
    @Type(() => ProductTagNestedProductToTagInput)
    productsWithStatus: ProductTagNestedProductToTagInput[];
}
@InputType()
export class ProductTagUpdateInput extends PartialType(ProductTagInput) {}
