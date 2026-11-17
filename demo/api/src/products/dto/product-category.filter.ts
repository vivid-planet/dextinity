import { DateTimeFilter, IdFilter, ManyToOneFilter, OneToManyFilter, StringFilter } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

@InputType()
export class ProductCategoryFilter {
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
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    slug?: StringFilter;
    @Field(() => OneToManyFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => OneToManyFilter)
    products?: OneToManyFilter;
    @Field(() => ManyToOneFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => ManyToOneFilter)
    type?: ManyToOneFilter;
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
    @Field(() => [ProductCategoryFilter], { nullable: true })
    @Type(() => ProductCategoryFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: ProductCategoryFilter[];
    @Field(() => [ProductCategoryFilter], { nullable: true })
    @Type(() => ProductCategoryFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: ProductCategoryFilter[];
}
