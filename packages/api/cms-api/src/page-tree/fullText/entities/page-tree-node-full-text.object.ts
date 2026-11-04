import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { FullTextType } from "@mikro-orm/postgresql";

import { PAGE_TREE_ENTITY } from "../../page-tree.constants";
import { PageTreeNodeInterface } from "../../types";

// Note: This file is intentionally not named *.entity.ts to exclude it from MikroORM's CLI migration glob pattern.
// The "PageTreeNodeFullText" view is created dynamically at startup by PageTreeFullTextService, not via migrations.

@Entity({ tableName: "PageTreeNodeFullText" })
export class PageTreeNodeFullText {
    @PrimaryKey({ columnType: "uuid", persist: false })
    pageTreeNodeId: string;

    @ManyToOne(() => PAGE_TREE_ENTITY, { joinColumn: "pageTreeNodeId" })
    pageTreeNode: PageTreeNodeInterface;

    @Property({ type: FullTextType })
    fullText: string;
}
