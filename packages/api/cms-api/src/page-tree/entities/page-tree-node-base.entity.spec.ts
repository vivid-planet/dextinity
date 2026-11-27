import { Entity, ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { defineConfig, MikroORM } from "@mikro-orm/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { PageTreeNodeCategory } from "../types.js";
import { PageTreeNodeBase } from "./page-tree-node-base.entity.js";

@Entity({ tableName: "PageTreeNode" })
class PageTreeNode extends PageTreeNodeBase {
    category: PageTreeNodeCategory;
}

describe("PageTreeNodeBase", () => {
    let orm: MikroORM;

    beforeAll(async () => {
        orm = await MikroORM.init(defineConfig({ metadataProvider: ReflectMetadataProvider, dbName: "test-db", entities: [PageTreeNode] }));
    });

    afterAll(async () => {
        await orm.close();
    });

    it("fills the full text with the name and slug on create and update", async () => {
        const fullTextProperty = orm.em.getMetadata().get(PageTreeNode).properties.fullText;
        const node = Object.assign(new PageTreeNode(), { name: "About us", slug: "about-us" });

        expect(await fullTextProperty.onCreate?.(node, orm.em)).toEqual({ A: "About us", D: "about-us" });
        expect(await fullTextProperty.onUpdate?.(node, orm.em)).toEqual({ A: "About us", D: "about-us" });
    });
});
