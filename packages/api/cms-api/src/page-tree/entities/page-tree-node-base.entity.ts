import { BaseEntity, Entity, Enum, FullTextType, Index, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { v4 as uuid } from "uuid";

import { EntityInfo } from "../../entity-info/entity-info.decorator";
import { PAGE_TREE_ENTITY } from "../page-tree.constants";
import { PageTreeNodeCategory, PageTreeNodeInterface, PageTreeNodeVisibility } from "../types";

@EntityInfo({
    sql: `SELECT "name", "secondaryInformation", "visible", "id", 'PageTreeNode' AS "entityName" FROM "PageTreeNodeEntityInfo"`,
})
@Entity({ abstract: true })
@ObjectType("PageTreeNodeBase", { isAbstract: true }) // ObjectType must be defined in base class! (The name "PageTreeNodeBase" is not used (we have no concrete type of PageTreeNodeBase))
export abstract class PageTreeNodeBase extends BaseEntity {
    static readonly tableName = PAGE_TREE_ENTITY;
    [OptionalProps]?: "createdAt" | "updatedAt" | "hideInMenu";

    @PrimaryKey({ columnType: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property({ columnType: "uuid", nullable: true, persist: false })
    @Field(() => String, { nullable: true })
    parentId: string | null;

    // Relation is defined in createPageTreeNodeEntity since it references the concrete page tree node entity
    parent?: PageTreeNodeInterface;

    @Property()
    @Field(() => Int)
    pos: number;

    @Property({ columnType: "text" })
    @Field()
    name: string;

    @Property({ columnType: "text" })
    @Field()
    slug: string;

    @Enum({ items: () => PageTreeNodeVisibility })
    @Field(() => PageTreeNodeVisibility)
    visibility: PageTreeNodeVisibility = PageTreeNodeVisibility.Unpublished;

    @Property({ columnType: "text" })
    @Field()
    documentType: string; // a stricter type is not possible, since this can be extended inside the application

    // @Column({ type: "json" })
    // scope?: Record<string, unknown>;

    @Property()
    @Field()
    hideInMenu: boolean = false;

    category: PageTreeNodeCategory;

    @Index({ type: "fulltext" })
    @Property<PageTreeNodeBase>({
        nullable: true,
        type: new FullTextType(),
        onUpdate: (page) => {
            return {
                A: page.name,
                D: page.slug,
            };
        },
    })
    fullText?: string;

    @Property({
        columnType: "timestamp with time zone",
        onUpdate: () => new Date(),
    })
    @Field()
    updatedAt: Date = new Date();
}
