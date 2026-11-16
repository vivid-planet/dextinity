import type { Type } from "@nestjs/common";
import { ArgsType, Field, Int } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

import type { RedirectScopeInterface } from "../types.js";
import { EmptyRedirectScope } from "./empty-redirect-scope.js";
import { RedirectSort } from "./redirect.sort.js";
import { RedirectFilter } from "./redirects.filter.js";

interface PaginatedRedirectsArgsInterface {
    scope: RedirectScopeInterface;
    search?: string;
    filter?: RedirectFilter;
    sort?: RedirectSort[];
    offset: number;
    limit: number;
}

export class PaginatedRedirectsArgsFactory {
    static create({ Scope }: { Scope: Type<RedirectScopeInterface> }): Type<PaginatedRedirectsArgsInterface> {
        @ArgsType()
        class PaginatedRedirectsArgs implements PaginatedRedirectsArgsInterface {
            @Field(() => Scope, { defaultValue: Scope === EmptyRedirectScope ? {} : undefined })
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: RedirectScopeInterface;

            @Field({ nullable: true })
            @IsOptional()
            @IsString()
            search?: string;

            @Field(() => RedirectFilter, { nullable: true })
            @ValidateNested()
            @TransformerType(() => RedirectFilter)
            filter?: RedirectFilter;

            @Field(() => [RedirectSort], { nullable: true })
            @ValidateNested({ each: true })
            @TransformerType(() => RedirectSort)
            sort?: RedirectSort[];

            @Field(() => Int, { defaultValue: 0 })
            @IsInt()
            @Min(0)
            offset: number;

            @Field(() => Int, { defaultValue: 25 })
            @Min(1)
            @Max(1000)
            limit: number;
        }
        return PaginatedRedirectsArgs;
    }
}
