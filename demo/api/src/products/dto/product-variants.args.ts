import { OffsetBasedPaginationArgs, SortDirection } from "@dextinity/cms-api";
import { ArgsType, Field, ID } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

import { ProductVariantFilter } from "./product-variant.filter.js";
import { ProductVariantSort, ProductVariantSortField } from "./product-variant.sort.js";

@ArgsType()
export class ProductVariantsArgs extends OffsetBasedPaginationArgs {
    @Field(() => ID)
    @IsUUID()
    product: string;
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
    @Field(() => ProductVariantFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ProductVariantFilter)
    @IsOptional()
    filter?: ProductVariantFilter;
    @Field(() => [ProductVariantSort], { defaultValue: [{ field: ProductVariantSortField.position, direction: SortDirection.ASC }] })
    @ValidateNested({ each: true })
    @Type(() => ProductVariantSort)
    sort: ProductVariantSort[];
}
