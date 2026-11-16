import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { FullTextType } from "@mikro-orm/postgresql";

import { resolvePageTreeNodeEntity } from "../../entities/resolve-page-tree-node-entity.js";
import type { PageTreeNodeInterface } from "../../types.js";

// Note: This file is intentionally not named *.entity.ts to exclude it from MikroORM's CLI migration glob pattern.
// The "PageTreeNodeFullText" view is created dynamically at startup by PageTreeFullTextService, not via migrations.

@Entity({ tableName: "PageTreeNodeFullText" })
export class PageTreeNodeFullText {
    @PrimaryKey({ columnType: "uuid", persist: false })
    pageTreeNodeId: string;

    @ManyToOne(() => resolvePageTreeNodeEntity(), { joinColumn: "pageTreeNodeId" })
    pageTreeNode: PageTreeNodeInterface;

    @Property({ type: FullTextType })
    fullText: string;
}
