import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
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
