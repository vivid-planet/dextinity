import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { FullTextType } from "@mikro-orm/postgresql";
import { Type } from "@nestjs/common";

import { PageTreeNodeInterface } from "../../types";

// Note: This file is intentionally not named *.entity.ts to exclude it from MikroORM's CLI migration glob pattern.
// The "PageTreeNodeFullText" view is created dynamically at startup by PageTreeFullTextService, not via migrations.

export interface PageTreeNodeFullTextInterface {
    pageTreeNodeId: string;
    pageTreeNode: PageTreeNodeInterface;
    fullText: string;
}

export function createPageTreeNodeFullTextEntity({
    PageTreeNode,
}: {
    PageTreeNode: Type<PageTreeNodeInterface>;
}): Type<PageTreeNodeFullTextInterface> {
    @Entity({ tableName: "PageTreeNodeFullText" })
    class PageTreeNodeFullText implements PageTreeNodeFullTextInterface {
        @PrimaryKey({ columnType: "uuid", persist: false })
        pageTreeNodeId: string;

        @ManyToOne(() => PageTreeNode, { joinColumn: "pageTreeNodeId" })
        pageTreeNode: PageTreeNodeInterface;

        @Property({ type: FullTextType })
        fullText: string;
    }

    return PageTreeNodeFullText;
}
