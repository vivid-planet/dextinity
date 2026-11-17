import { OffsetBasedPaginationArgs, SortDirection } from "@dextinity/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { ProductFilter } from "./product.filter.js";
import { ProductSort, ProductSortField } from "./product.sort.js";

@ArgsType()
export class ProductsArgs extends OffsetBasedPaginationArgs {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
    @Field(() => ProductFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ProductFilter)
    @IsOptional()
    filter?: ProductFilter;
    @Field(() => [ProductSort], { defaultValue: [{ field: ProductSortField.createdAt, direction: SortDirection.ASC }] })
    @ValidateNested({ each: true })
    @Type(() => ProductSort)
    sort: ProductSort[];
}
