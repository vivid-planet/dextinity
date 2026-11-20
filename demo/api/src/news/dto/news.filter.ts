import { DateTimeFilter, IdFilter, OneToManyFilter, StringFilter } from "@dextinity/cms-api";
import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";

import { NewsCategoryEnumFilter } from "./news-category.enum-filter.js";
import { NewsStatusEnumFilter } from "./news-status.enum-filter.js";

@InputType()
export class NewsFilter {
    @Field(() => IdFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => IdFilter)
    id?: IdFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    slug?: StringFilter;
    @Field(() => StringFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => StringFilter)
    title?: StringFilter;
    @Field(() => NewsStatusEnumFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => NewsStatusEnumFilter)
    status?: NewsStatusEnumFilter;
    @Field(() => DateTimeFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => DateTimeFilter)
    date?: DateTimeFilter;
    @Field(() => NewsCategoryEnumFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => NewsCategoryEnumFilter)
    category?: NewsCategoryEnumFilter;
    @Field(() => OneToManyFilter, { nullable: true })
    @ValidateNested()
    @IsOptional()
    @Type(() => OneToManyFilter)
    comments?: OneToManyFilter;
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
    @Field(() => [NewsFilter], { nullable: true })
    @Type(() => NewsFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    and?: NewsFilter[];
    @Field(() => [NewsFilter], { nullable: true })
    @Type(() => NewsFilter)
    @ValidateNested({ each: true })
    @IsOptional()
    or?: NewsFilter[];
}
