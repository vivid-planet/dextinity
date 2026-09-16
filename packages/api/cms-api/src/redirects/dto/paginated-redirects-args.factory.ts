import { Type } from "@nestjs/common";
import { ArgsType, Field, Int } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

import { ScopeInterface } from "../../user-permissions/interfaces/scope.interface";
import { EmptyRedirectScope } from "./empty-redirect-scope";
import { RedirectSort } from "./redirect.sort";
import { RedirectFilter } from "./redirects.filter";

interface PaginatedRedirectsArgsInterface {
    scope: ScopeInterface;
    search?: string;
    filter?: RedirectFilter;
    sort?: RedirectSort[];
    offset: number;
    limit: number;
}

export class PaginatedRedirectsArgsFactory {
    static create({ Scope }: { Scope: Type<ScopeInterface> }): Type<PaginatedRedirectsArgsInterface> {
        @ArgsType()
        class PaginatedRedirectsArgs implements PaginatedRedirectsArgsInterface {
            @Field(() => Scope, { defaultValue: Scope === EmptyRedirectScope ? {} : undefined })
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: ScopeInterface;

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
