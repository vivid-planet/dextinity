import { Type } from "@nestjs/common";
import { Args, createUnionType, Field, Int, ObjectType, Query, Resolver } from "@nestjs/graphql";

import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { ScopeInterface } from "../../user-permissions/interfaces/scope.interface";
import { DamItemsService } from "./dam-items.service";
import { createDamItemArgs, createDamItemPositionArgs, DamItemPositionArgsInterface, DamItemsArgsInterface } from "./dto/dam-items.args";
import { EmptyDamScope } from "./dto/empty-dam-scope";
import { FileInterface } from "./entities/file.entity";
import { FolderInterface } from "./entities/folder.entity";

export type DamItemInterface = FileInterface | FolderInterface;

export function createDamItemsResolver({
    File,
    Folder,
    Scope: PassedScope,
}: {
    File: Type<FileInterface>;
    Folder: Type<FolderInterface>;
    Scope?: Type<ScopeInterface>;
}): Type<unknown> {
    const DamItem = createUnionType({
        name: "DamItem",
        types: () => [File, Folder] as const,
    });

    const Scope = PassedScope ?? EmptyDamScope;
    const hasNonEmptyScope = PassedScope != null;

    function nonEmptyScopeOrNothing(scope: ScopeInterface): ScopeInterface | undefined {
        // GraphQL sends the scope object with a null prototype ([Object: null prototype] { <key>: <value> }), but MikroORM uses the
        // object's hasOwnProperty method internally, resulting in a "object.hasOwnProperty is not a function" error. To fix this, we
        // create a "real" JavaScript object by using the spread operator.
        // See https://github.com/mikro-orm/mikro-orm/issues/2846 for more information.
        return hasNonEmptyScope ? { ...scope } : undefined;
    }

    const DamItemsArgs = createDamItemArgs({ Scope });
    const DamItemsPositionArgs = createDamItemPositionArgs({ Scope });

    @ObjectType()
    class PaginatedDamItems {
        @Field(() => [DamItem])
        nodes: DamItemInterface[];

        @Field(() => Int)
        totalCount: number;

        constructor(nodes: DamItemInterface[], totalCount: number) {
            this.nodes = nodes;
            this.totalCount = totalCount;
        }
    }

    @RequiredPermission(["dam"], { skipScopeCheck: !hasNonEmptyScope })
    @Resolver(() => DamItem)
    class DamItemsResolver {
        constructor(private readonly damItemsService: DamItemsService) {}

        @Query(() => PaginatedDamItems)
        async damItemsList(@Args({ type: () => DamItemsArgs }) args: DamItemsArgsInterface): Promise<PaginatedDamItems> {
            const [damItems, totalCount] = await this.damItemsService.findAndCount(args, nonEmptyScopeOrNothing(args.scope));
            return new PaginatedDamItems(damItems, totalCount);
        }

        @Query(() => Int)
        async damItemListPosition(@Args({ type: () => DamItemsPositionArgs }) args: DamItemPositionArgsInterface): Promise<number> {
            return this.damItemsService.getDamItemPosition(args, nonEmptyScopeOrNothing(args.scope));
        }
    }

    return DamItemsResolver;
}
