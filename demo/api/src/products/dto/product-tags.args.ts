import { OffsetBasedPaginationArgs, SortDirection } from "@dextinity/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { ProductTagFilter } from "./product-tag.filter.js";
import { ProductTagSort, ProductTagSortField } from "./product-tag.sort.js";

@ArgsType()
export class ProductTagsArgs extends OffsetBasedPaginationArgs {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
    @Field(() => ProductTagFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ProductTagFilter)
    @IsOptional()
    filter?: ProductTagFilter;
    @Field(() => [ProductTagSort], { defaultValue: [{ field: ProductTagSortField.createdAt, direction: SortDirection.ASC }] })
    @ValidateNested({ each: true })
    @Type(() => ProductTagSort)
    sort: ProductTagSort[];
}
