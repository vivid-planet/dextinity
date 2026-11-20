import { DateTimeFilter, IdFilter, StringFilter } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class ProductVariantFilter {
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
    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    createdAt?: DateTimeFilter;
    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    updatedAt?: DateTimeFilter;
    @Field(() => [ProductVariantFilter], { nullable: true })
    @Type(() => ProductVariantFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: ProductVariantFilter[];
    @Field(() => [ProductVariantFilter], { nullable: true })
    @Type(() => ProductVariantFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: ProductVariantFilter[];
}
