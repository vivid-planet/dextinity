import type { Type } from "@nestjs/common";
import { ArgsType, Field, ID, InputType, IntersectionType } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

import { OffsetBasedPaginationArgs } from "../../../common/pagination/offset-based.args.js";
import { SortArgs } from "../../../common/sorting/sort.args.js";
import type { DamScopeInterface } from "../../types.js";
import { EmptyDamScope } from "./empty-dam-scope.js";

@InputType()
export class FolderFilterInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    searchText?: string;
}

export interface FolderArgsInterface extends OffsetBasedPaginationArgs, SortArgs {
    scope: DamScopeInterface;
    parentId?: string;
    includeArchived?: boolean;
    filter?: FolderFilterInput;
}

export function createFolderArgs({ Scope }: { Scope: Type<DamScopeInterface> }): Type<FolderArgsInterface> {
    @ArgsType()
    class FolderArgs extends IntersectionType(OffsetBasedPaginationArgs, SortArgs) implements FolderArgsInterface {
        @Field(() => Scope, { defaultValue: Scope === EmptyDamScope ? {} : undefined })
        @TransformerType(() => Scope)
        @ValidateNested()
        scope: DamScopeInterface;

        @Field(() => ID, { nullable: true })
        @IsOptional()
        @IsUUID()
        parentId?: string;

        @Field({ nullable: true })
        @IsOptional()
        @IsBoolean()
        includeArchived?: boolean;

        @Field(() => FolderFilterInput, { nullable: true })
        @TransformerType(() => FolderFilterInput)
        @IsOptional()
        @ValidateNested()
        filter?: FolderFilterInput;
    }

    return FolderArgs;
}

export interface FolderByNameAndParentIdArgsInterface {
    scope: DamScopeInterface;
    name: string;
    parentId?: string;
}

export function createFolderByNameAndParentIdArgs({ Scope }: { Scope: Type<DamScopeInterface> }): Type<FolderByNameAndParentIdArgsInterface> {
    @ArgsType()
    class FolderByNameAndParentIdArgs implements FolderByNameAndParentIdArgsInterface {
        @Field(() => Scope, { defaultValue: Scope === EmptyDamScope ? {} : undefined })
        @TransformerType(() => Scope)
        @ValidateNested()
        scope: DamScopeInterface;

        @Field()
        @IsString()
        name: string;

        @Field(() => ID, { nullable: true })
        @IsOptional()
        @IsUUID()
        parentId?: string;
    }

    return FolderByNameAndParentIdArgs;
}

export interface DamFolderListPositionArgs extends SortArgs {
    scope: DamScopeInterface;
    parentId?: string;
    includeArchived?: boolean;
    filter?: FolderFilterInput;
}
