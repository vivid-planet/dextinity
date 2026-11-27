import { ArgsType, Field, Int } from "@nestjs/graphql";
import { ArrayMaxSize, IsArray, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { GraphQLJSONObject } from "graphql-scalars";

import type { ContentScope } from "../../user-permissions/interfaces/content-scope.interface.js";

@ArgsType()
export class FullTextSearchArgs {
    @Field()
    @IsString()
    @MaxLength(200)
    search: string;

    @Field(() => GraphQLJSONObject, { nullable: true })
    @IsOptional()
    @IsObject()
    scope?: ContentScope;

    @Field(() => [String], { nullable: true, description: "Only returns results of these types. The counts in `types` include all types." })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MaxLength(100, { each: true })
    types?: string[];

    @Field(() => Int, { defaultValue: 0 })
    @IsInt()
    @Min(0)
    offset: number;

    @Field(() => Int, { defaultValue: 25 })
    @IsInt()
    @Min(1)
    @Max(50)
    limit: number;
}
