import { IsNullable, PartialType } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";

import { Coordinates } from "../coordinates.type.js";
import { Address, AddressAsEmbeddable } from "../entities/manufacturer.entity.js";
import { ProductType } from "../entities/product-type.enum.js";

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
}
@InputType()
export class ManufacturerUpdateInput extends PartialType(ManufacturerInput) {}
