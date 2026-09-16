import { Type } from "@nestjs/common";
import { ArgsType, Field, ID, InputType, IntersectionType } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsBoolean, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

import { OffsetBasedPaginationArgs } from "../../../common/pagination/offset-based.args";
import { SortArgs } from "../../../common/sorting/sort.args";
import { ScopeInterface } from "../../../user-permissions/interfaces/scope.interface";
import { EmptyDamScope } from "./empty-dam-scope";

@InputType()
export class FolderFilterInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    searchText?: string;
}

export interface FolderArgsInterface extends OffsetBasedPaginationArgs, SortArgs {
    scope: ScopeInterface;
    parentId?: string;
    includeArchived?: boolean;
    filter?: FolderFilterInput;
}

export function createFolderArgs({ Scope }: { Scope: Type<ScopeInterface> }): Type<FolderArgsInterface> {
    @ArgsType()
    class FolderArgs extends IntersectionType(OffsetBasedPaginationArgs, SortArgs) implements FolderArgsInterface {
        @Field(() => Scope, { defaultValue: Scope === EmptyDamScope ? {} : undefined })
        @TransformerType(() => Scope)
        @ValidateNested()
        scope: ScopeInterface;

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
    scope: ScopeInterface;
    name: string;
    parentId?: string;
}

export function createFolderByNameAndParentIdArgs({ Scope }: { Scope: Type<ScopeInterface> }): Type<FolderByNameAndParentIdArgsInterface> {
    @ArgsType()
    class FolderByNameAndParentIdArgs implements FolderByNameAndParentIdArgsInterface {
        @Field(() => Scope, { defaultValue: Scope === EmptyDamScope ? {} : undefined })
        @TransformerType(() => Scope)
        @ValidateNested()
        scope: ScopeInterface;

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
    scope: ScopeInterface;
    parentId?: string;
    includeArchived?: boolean;
    filter?: FolderFilterInput;
}
