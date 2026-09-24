import { Embedded, Entity, Enum, Index, ManyToOne } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";
import { Field, ObjectType } from "@nestjs/graphql";

import { PAGE_TREE_ENTITY } from "../page-tree.constants";
import { PageTreeNodeInterface, ScopeInterface } from "../types";
import { PageTreeNodeBase } from "./page-tree-node-base.entity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AbstractPageTreeNodeClass<T extends PageTreeNodeBase> = abstract new (...args: any[]) => T;

interface CreatePageTreeNodeEntityOptions<TBase extends PageTreeNodeBase> {
    /**
     * Abstract entity extending `PageTreeNodeBase` that adds application-specific properties to the page tree node.
     */
    Base?: AbstractPageTreeNodeClass<TBase>;
    /**
     * Enum of the page tree categories. Must be registered as a GraphQL enum.
     */
    Category: object;
}

export function createPageTreeNodeEntity<TBase extends PageTreeNodeBase = PageTreeNodeBase, TScope extends ScopeInterface = ScopeInterface>(
    options: CreatePageTreeNodeEntityOptions<TBase> & { Scope: Type<TScope> },
): Type<TBase & { scope: TScope }>;
export function createPageTreeNodeEntity<TBase extends PageTreeNodeBase = PageTreeNodeBase>(
    options: CreatePageTreeNodeEntityOptions<TBase>,
): Type<TBase>;
export function createPageTreeNodeEntity({
    Base = PageTreeNodeBase,
    Category,
    Scope,
}: CreatePageTreeNodeEntityOptions<PageTreeNodeBase> & { Scope?: Type<ScopeInterface> }): Type<PageTreeNodeBase> {
    @Entity({ abstract: true })
    @ObjectType({ isAbstract: true })
    abstract class PageTreeNodeWithRelations extends Base {
        @ManyToOne(() => PageTreeNode, { nullable: true, joinColumn: "parentId" })
        @Index()
        parent?: PageTreeNodeInterface;

        @Enum({ items: () => Category })
        @Field(() => Category)
        category: string;
    }

    function createConcretePageTreeNodeEntity(): Type<PageTreeNodeBase> {
        if (Scope) {
            @Entity({ tableName: PAGE_TREE_ENTITY })
            @ObjectType("PageTreeNode")
            class PageTreeNode extends PageTreeNodeWithRelations {
                @Embedded(() => Scope)
                @Field(() => Scope)
                scope: ScopeInterface;
            }
            return PageTreeNode;
        } else {
            @Entity({ tableName: PAGE_TREE_ENTITY })
            @ObjectType("PageTreeNode")
            class PageTreeNode extends PageTreeNodeWithRelations {}
            return PageTreeNode;
        }
    }

    const PageTreeNode = createConcretePageTreeNodeEntity();

    return PageTreeNode;
}
