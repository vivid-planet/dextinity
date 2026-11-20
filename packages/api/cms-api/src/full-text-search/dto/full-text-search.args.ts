import { ArgsType, Field, Int } from "@nestjs/graphql";
import { ArrayMaxSize, IsArray, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import { OffsetBasedPaginationArgs } from "../../common/pagination/offset-based.args";
import { ContentScope } from "../../user-permissions/interfaces/content-scope.interface";

@ArgsType()
export class FullTextSearchArgs extends OffsetBasedPaginationArgs {
    @Field()
    @IsString()
    @MaxLength(200)
    search: string;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    @IsObject()
    scope?: ContentScope;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MaxLength(100, { each: true })
    types?: string[];

    // Lower than the default maximum because a snippet is computed for every result.
    @Field(() => Int, { defaultValue: 25 })
    @IsInt()
    @Min(1)
    @Max(50)
    limit: number;
}
