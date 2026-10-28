import type { Type } from "@nestjs/common";
import { ArgsType, Field } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

import { OffsetBasedPaginationArgs } from "../../common/pagination/offset-based.args.js";
import type { PageTreeNodeCategory, ScopeInterface } from "../types.js";
import { EmptyPageTreeNodeScope } from "./empty-page-tree-node-scope.js";
import { PageTreeNodeSort } from "./page-tree-node.sort.js";

interface PaginatedPageTreeNodesArgsInterface {
    scope: ScopeInterface;
    category?: string;
    sort?: PageTreeNodeSort[];
    offset: number;
    limit: number;
    documentType?: string;
}

export class PaginatedPageTreeNodesArgsFactory {
    static create({ Scope }: { Scope: Type<ScopeInterface> }): Type<PaginatedPageTreeNodesArgsInterface> {
        @ArgsType()
        class PageTreeNodesArgs extends OffsetBasedPaginationArgs implements PaginatedPageTreeNodesArgsInterface {
            @Field(() => Scope, { defaultValue: Scope === EmptyPageTreeNodeScope ? {} : undefined })
            @TransformerType(() => Scope)
            @ValidateNested()
            scope: ScopeInterface;

            @Field({ nullable: true })
            @IsOptional()
            category?: PageTreeNodeCategory;

            @Field(() => [PageTreeNodeSort], { nullable: true })
            @TransformerType(() => PageTreeNodeSort)
            @ValidateNested({ each: true })
            sort?: PageTreeNodeSort[];

            @Field({ nullable: true })
            @IsOptional()
            @IsString()
            documentType?: string;
        }
        return PageTreeNodesArgs;
    }
}
