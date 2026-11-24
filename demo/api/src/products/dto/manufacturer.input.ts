import { IsNullable, IsTipTapRichText, PartialType, type TipTapRichTextBlockContent } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Coordinates } from "@src/products/coordinates.type.js";
import { Address, AddressAsEmbeddable } from "@src/products/entities/manufacturer.entity.js";
import { ProductType } from "@src/products/entities/product-type.enum.js";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

@InputType()
export class ManufacturerInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    name: string;
    @IsNullable()
    @ValidateNested()
    @Type(() => Address)
    @Field(() => Address, { nullable: true })
    address?: Address;
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => AddressAsEmbeddable)
    @Field(() => AddressAsEmbeddable)
    addressAsEmbeddable: AddressAsEmbeddable;
    @IsNullable()
    @ValidateNested()
    @Type(() => Coordinates)
    @Field(() => Coordinates, { nullable: true })
    coordinates?: Coordinates;
    @IsNullable()
    @IsEnum(ProductType)
    @Field(() => ProductType, { nullable: true, defaultValue: null })
    productType?: ProductType;
    @IsNullable()
    @IsTipTapRichText({ textBlocks: [{ name: "paragraph", tag: "p" }] })
    @Field(() => GraphQLJSONObject, { nullable: true })
    description?: TipTapRichTextBlockContent;
}
@InputType()
export class ManufacturerUpdateInput extends PartialType(ManufacturerInput) {}
