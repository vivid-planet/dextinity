import { OffsetBasedPaginationArgs, SortDirection } from "@dextinity/cms-api";
import { ArgsType, Field } from "@nestjs/graphql";
import { NewsContentScope } from "@src/news/entities/news.entity.js";
import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { NewsFilter } from "./news.filter.js";
import { NewsSort, NewsSortField } from "./news.sort.js";

@ArgsType()
export class NewsListArgs extends OffsetBasedPaginationArgs {
    @Field(() => NewsContentScope)
    @ValidateNested()
    @Type(() => NewsContentScope)
    scope: NewsContentScope;
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
    @Field(() => NewsFilter, { nullable: true })
    @ValidateNested()
    @Type(() => NewsFilter)
    @IsOptional()
    filter?: NewsFilter;
    @Field(() => [NewsSort], { defaultValue: [{ field: NewsSortField.createdAt, direction: SortDirection.ASC }] })
    @ValidateNested({ each: true })
    @Type(() => NewsSort)
    sort: NewsSort[];
}
