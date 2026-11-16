import type { Type } from "@nestjs/common";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";

import { SortArgs } from "../../common/sorting/sort.args.js";
import type { SortDirection } from "../../common/sorting/sort-direction.enum.js";
import { RedirectGenerationType } from "../redirects.enum.js";
import type { RedirectScopeInterface } from "../types.js";
import { EmptyRedirectScope } from "./empty-redirect-scope.js";

interface RedirectsArgsInterface {
    scope: RedirectScopeInterface;
    query?: string;
    type?: RedirectGenerationType;
    active?: boolean;
    sortColumnName?: string;
    sortDirection?: SortDirection;
}

export class RedirectsArgsFactory {
    static create({ Scope }: { Scope: Type<RedirectScopeInterface> }): Type<RedirectsArgsInterface> {
        @ArgsType()
        class RedirectsArgs extends SortArgs implements RedirectsArgsInterface {
            @Field(() => Scope, { defaultValue: Scope === EmptyRedirectScope ? {} : undefined })
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: RedirectScopeInterface;

            @Field({ nullable: true })
            @IsOptional()
            @IsString()
            query?: string;

            @Field(() => RedirectGenerationType, { nullable: true })
            @IsOptional()
            @IsEnum(RedirectGenerationType)
            type?: RedirectGenerationType;

            @Field({ nullable: true })
            @IsOptional()
            @IsBoolean()
            active?: boolean;
        }
        return RedirectsArgs;
    }
}
