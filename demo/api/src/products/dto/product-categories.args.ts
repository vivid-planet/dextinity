import { OffsetBasedPaginationArgs, SortDirection } from "@dextinity/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { ProductCategoryFilter } from "./product-category.filter.js";
import { ProductCategorySort, ProductCategorySortField } from "./product-category.sort.js";

@ArgsType()
export class ProductCategoriesArgs extends OffsetBasedPaginationArgs {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
    @Field(() => ProductCategoryFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ProductCategoryFilter)
    @IsOptional()
    filter?: ProductCategoryFilter;
    @Field(() => [ProductCategorySort], { defaultValue: [{ field: ProductCategorySortField.position, direction: SortDirection.ASC }] })
    @ValidateNested({ each: true })
    @Type(() => ProductCategorySort)
    sort: ProductCategorySort[];
}
