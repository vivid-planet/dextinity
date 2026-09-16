import { Type } from "@nestjs/common";
import { ArgsType, Field, ID, InputType, IntersectionType, registerEnumType } from "@nestjs/graphql";
import { Type as TransformerType } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

import { OffsetBasedPaginationArgs } from "../../../common/pagination/offset-based.args";
import { SortArgs } from "../../../common/sorting/sort.args";
import { ScopeInterface } from "../../../user-permissions/interfaces/scope.interface";
import { EmptyDamScope } from "./empty-dam-scope";

export enum DamItemType {
    File = "File",
    Folder = "Folder",
}
registerEnumType(DamItemType, {
    name: "DamItemType",
});

@InputType()
export class DamItemFilterInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    searchText?: string;

    @Field(() => [String], { nullable: true })
    @IsOptional()
    @IsString({ each: true })
    mimetypes?: string[];
}

export interface DamItemsArgsInterface extends OffsetBasedPaginationArgs, SortArgs {
    scope: ScopeInterface;
    folderId?: string;
    includeArchived?: boolean;
    filter?: DamItemFilterInput;
}

export function createDamItemArgs({ Scope }: { Scope: Type<ScopeInterface> }): Type<DamItemsArgsInterface> {
    @ArgsType()
    class DamItemsArgs extends IntersectionType(OffsetBasedPaginationArgs, SortArgs) implements DamItemsArgsInterface {
        @Field(() => Scope, { defaultValue: Scope === EmptyDamScope ? {} : undefined })
        @TransformerType(() => Scope)
        @ValidateNested()
        scope: ScopeInterface;

        @Field(() => ID, { nullable: true })
        @IsOptional()
        @IsUUID()
        folderId?: string;

        @Field({ nullable: true })
        @IsOptional()
        @IsBoolean()
        includeArchived?: boolean;

        @Field(() => DamItemFilterInput, { nullable: true })
        @TransformerType(() => DamItemFilterInput)
        @IsOptional()
        @ValidateNested()
        filter?: DamItemFilterInput;
    }

    return DamItemsArgs;
}

export interface DamItemPositionArgsInterface extends SortArgs {
    scope: ScopeInterface;
    id: string;
    type: DamItemType;
    folderId?: string;
    includeArchived?: boolean;
    filter?: DamItemFilterInput;
}

export function createDamItemPositionArgs({ Scope }: { Scope: Type<ScopeInterface> }): Type<DamItemPositionArgsInterface> {
    @ArgsType()
    class DamItemPositionArgs extends SortArgs implements DamItemPositionArgsInterface {
        @Field(() => Scope, { defaultValue: Scope === EmptyDamScope ? {} : undefined })
        @TransformerType(() => Scope)
        @ValidateNested()
        scope: ScopeInterface;

        @Field(() => ID)
        @IsUUID()
        id: string;

        @Field(() => DamItemType)
        @IsEnum(DamItemType)
        type: DamItemType;

        @Field(() => ID, { nullable: true })
        @IsOptional()
        @IsUUID()
        folderId?: string;

        @Field({ nullable: true })
        @IsOptional()
        @IsBoolean()
        includeArchived?: boolean;

        @Field(() => DamItemFilterInput, { nullable: true })
        @TransformerType(() => DamItemFilterInput)
        @IsOptional()
        @ValidateNested()
        filter?: DamItemFilterInput;
    }

    return DamItemPositionArgs;
}
