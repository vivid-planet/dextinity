import { Migration } from "@mikro-orm/migrations";

export class Migration20250531565156 extends Migration {
    async up(): Promise<void> {
        this.addSql(`CREATE OR REPLACE VIEW "PageTreeNodeEntityInfo" AS
WITH RECURSIVE "PageTreeNodePath" AS (
    -- root nodes
    SELECT
        "id",
        "parentId",
        "slug",
        "slug" AS path,
        ("visibility" = 'Published') AS inherited_visible
    FROM "PageTreeNode"
    WHERE "parentId" IS NULL

    UNION ALL

    -- Recurse into child nodes
    SELECT
        "child"."id",
        "child"."parentId",
        "child"."slug",
        CONCAT("parent".path, '/', "child"."slug") AS path,
        "parent"."inherited_visible" AND ("child"."visibility" = 'Published') AS inherited_visible
    FROM "PageTreeNode" AS "child"
    JOIN "PageTreeNodePath" AS "parent" ON "child"."parentId" = "parent"."id"
)

SELECT "PageTreeNode"."id"::text AS "id",
       "PageTreeNode"."name",
       "PageTreeNodePath"."path" AS "secondaryInformation",
       "PageTreeNodePath"."inherited_visible" AS "visible"
    FROM "PageTreeNode"
    JOIN "PageTreeNodePath" ON "PageTreeNode"."id" = "PageTreeNodePath"."id"`);
    }
}
