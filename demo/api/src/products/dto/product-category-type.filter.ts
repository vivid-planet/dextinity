import { IdFilter, OneToManyFilter, StringFilter } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class ProductCategoryTypeFilter {
    @Field(() => IdFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => IdFilter)
    id?: IdFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    title?: StringFilter;
    @Field(() => OneToManyFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => OneToManyFilter)
    categories?: OneToManyFilter;
    @Field(() => [ProductCategoryTypeFilter], { nullable: true })
    @Type(() => ProductCategoryTypeFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: ProductCategoryTypeFilter[];
    @Field(() => [ProductCategoryTypeFilter], { nullable: true })
    @Type(() => ProductCategoryTypeFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: ProductCategoryTypeFilter[];
}
