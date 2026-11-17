import { IsNullable, IsSlug, PartialType } from "@dextinity/cms-api";
import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from "class-validator";

@InputType()
export class ProductCategoryInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    title: string;
    @IsNotEmpty()
    @IsString()
    @IsSlug()
    @Field()
    slug: string;
    @IsOptional()
    @Min(1)
    @IsInt()
    @Field(() => Int, { nullable: true })
    position?: number;
    @Field(() => [ID], { defaultValue: [] })
    @IsArray()
    @IsUUID(undefined, { each: true })
    products: string[];
    @IsNullable()
    @Field(() => ID, { nullable: true, defaultValue: null })
    @IsUUID()
    type?: string;
}
@InputType()
export class ProductCategoryUpdateInput extends PartialType(ProductCategoryInput) {}
