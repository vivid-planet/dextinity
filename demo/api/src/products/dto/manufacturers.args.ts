import { OffsetBasedPaginationArgs, SortDirection } from "@dextinity/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { ManufacturerFilter } from "./manufacturer.filter.js";
import { ManufacturerSort, ManufacturerSortField } from "./manufacturer.sort.js";

@ArgsType()
export class ManufacturersArgs extends OffsetBasedPaginationArgs {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
    @Field(() => ManufacturerFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ManufacturerFilter)
    @IsOptional()
    filter?: ManufacturerFilter;
    @Field(() => [ManufacturerSort], { defaultValue: [{ field: ManufacturerSortField.id, direction: SortDirection.ASC }] })
    @ValidateNested({ each: true })
    @Type(() => ManufacturerSort)
    sort: ManufacturerSort[];
}
