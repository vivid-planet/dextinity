import { OffsetBasedPaginationArgs } from "@dextinity/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { ManufacturerCountryFilter } from "./manufacturer-country.filter.js";

@ArgsType()
export class ManufacturerCountriesArgs extends OffsetBasedPaginationArgs {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
    @Field(() => ManufacturerCountryFilter, { nullable: true })
    @ValidateNested()
    @Type(() => ManufacturerCountryFilter)
    @IsOptional()
    filter?: ManufacturerCountryFilter;
}
