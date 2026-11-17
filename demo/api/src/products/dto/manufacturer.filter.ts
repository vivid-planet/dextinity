import { DateTimeFilter, IdFilter, NumberFilter, StringFilter } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { ProductTypeEnumFilter } from "./product-type.enum-filter.js";

@InputType()
export class ManufacturerFilter {
    @Field(() => IdFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => IdFilter)
    id?: IdFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    name?: StringFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    addressAsEmbeddable_street?: StringFilter;
    @Field(() => NumberFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => NumberFilter)
    addressAsEmbeddable_streetNumber?: NumberFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    addressAsEmbeddable_zip?: StringFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    addressAsEmbeddable_country?: StringFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    addressAsEmbeddable_alternativeAddress_street?: StringFilter;
    @Field(() => NumberFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => NumberFilter)
    addressAsEmbeddable_alternativeAddress_streetNumber?: NumberFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    addressAsEmbeddable_alternativeAddress_zip?: StringFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    addressAsEmbeddable_alternativeAddress_country?: StringFilter;
    @Field(() => ProductTypeEnumFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => ProductTypeEnumFilter)
    productType?: ProductTypeEnumFilter;
    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    updatedAt?: DateTimeFilter;
    @Field(() => [ManufacturerFilter], { nullable: true })
    @Type(() => ManufacturerFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: ManufacturerFilter[];
    @Field(() => [ManufacturerFilter], { nullable: true })
    @Type(() => ManufacturerFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: ManufacturerFilter[];
}
